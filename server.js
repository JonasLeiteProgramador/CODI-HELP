import { Client, IntentsBitField, MessageCollector } from "discord.js";
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

// Inicializar o cliente do Discord
// Inicializar o cliente do Discord
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]
});

// Inicializar o chatbot do Gemini
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

let lastMessage = '';

const saudacoes = [
    'ola', 'oi', 'e ai', 'bom dia', 'boa tarde', 'boa noite', 'opa', 'eai', 'eae',
    'Olá', 'Opa', 'Bom dia', 'Boa tarde', 'Boa noite', 
    'OLA', 'OI', 'E AI', 'BOM DIA', 'BOA TARDE', 'BOA NOITE', 'OPA', 'EAI', 'EAE',
    'oLa', 'Oi', 'E aI', 'BoA taRde', 'Boa NOite', 'EaI', 'EaE'
];

  
  const perguntas = [
    'tudo bem?', 'tudo bom?', 'como você tá?', 'tá tudo bem?', 'tá tudo bom?', 'como está você?', 'está tudo bem?',
    'TUDO BEM?', 'TUDO BOM?', 'COMO VOCÊ TÁ?', 'TÁ TUDO BEM?', 'TÁ TUDO BOM?', 'COMO ESTÁ VOCÊ?', 'ESTÁ TUDO BEM?',
    'Tudo bem?', 'Tudo bom?', 'Como você tá?', 'Tá tudo bem?', 'Tá tudo bom?', 'Como está você?', 'Está tudo bem?',
    'tUdO bEm?', 'tUdO bOm?', 'cOmO vOcÊ tÁ?', 'tÁ tUdO bEm?', 'tÁ tUdO bOm?', 'cOmO eStÁ vOcÊ?', 'eStÁ tUdO bEm?',
    'Tudo Bem?', 'Tudo Bom?', 'Como Você Tá?', 'Tá Tudo Bem?', 'Tá Tudo Bom?', 'Como Está Você?', 'Está Tudo Bem?'
  ];
  
async function sendSplitMessage(channel, message) {
    while (message.length > 0) {
       
        const part = message.substring(0, 1999);
        message = message.substring(1999);
        await channel.send(part);
    }
}

const actions = {
    saudacoes: () => 'Olá! Prazer, Codi Help. Como posso te ajudar hoje?',
    'mini mapa de softskills': () => ({ text: 'Aqui está o seu mini-mapa de habilidades sociais!', files: ['./mapas/mapaSt.pdf'] }),
    'mini mapa de inglês': () => ({ text: 'Aqui está o seu mini-mapa de inglês!', files: ['./mapas/mapaIn.pdf'] }),
    'mini mapa de programação': () => ({ text: 'Aqui está o seu mini-mapa de programação!', files: ['./mapas/mapaPg.pdf'] }),
    'cronograma': () => ({ text: 'Aqui está o nosso cronograma!', files: ['./cronogramas/cronograma.pdf'] }),
    'arremate': () => ({ text: 'Aqui está o link de todos os arremates: https://classroom.google.com/c/NjUwOTIxNjM3MDIx/m/NjUzNDI2MDYyNTYz/details' }),
    'justificar': () => ({ text: 'Justifique aqui a sua falta: https://docs.google.com/forms/d/e/1FAIpQLSflcGYDbsk38oDfYteGEnm8aKzUw8c14jYbFpSIXvQu0eA3Lw/viewform' }),
    'ajuda': () => 'Vi que você pediu uma ajuda! Sou capaz de fazer de tudo para te ajudar a se guiar neste curso! Precisa do mini-mapa de programação? Basta escrever "mini-mapa" seguido pelo nome da matéria! Quer o cronograma? Basta escrever "cronograma"! Precisa justificar sua falta? Escreva "justificar" em sua frase. Quer os deveres? Escreva "arremate".',
    perguntas: () => 'Estou ótimo! E você? Mas devo ressaltar que máquinas não sentem nada, viu! -_-'
};


async function sendMessageToGemini(message) {
    try {
        if (message.length > 2000) {
            throw new Error('Limite de caracteres excedido.');
        }

        const result = await model.generateContent(message);
        const response = result.response.text().substring(0, 2000);

        return response;
    } catch (error) {
        console.error('Erro ao enviar mensagem para o Gemini:', error);
        return 'Desculpe, o Gemini atingiu o limite de 1999 caracteres na resposta. Por favor, resuma mais sua resposta.';
    }
}

async function handleDiscordMessage(message) {
    if (message.author.bot) return;

    const content = message.content.toLowerCase();

    if (content.includes('ajuda')) {
        const response = actions['ajuda']();
        message.channel.send(response);
        return;
    }

    let foundAction = false;
    for (const keyword in actions) {
        if (keyword === 'saudacoes') {
            if (saudacoes.some(saudacao => content.includes(saudacao))) {
                const response = actions[keyword]();
                message.channel.send(response);
                foundAction = true;
                return;
                
            }
        } else if (keyword === 'perguntas') {
            if (perguntas.some(pergunta => content.includes(pergunta))) {
                const response = actions[keyword]();
                message.channel.send(response);
                foundAction = true;
                return;
            }
        } else if (content.includes(keyword)) {
            const response = actions[keyword]();
            message.channel.send(response.text);
            if (response.files)
                message.channel.send(response);
            foundAction = true;
            break
        }
    }
    if (!foundAction) {
        message.channel.send('Não entendi muito bem. Poderia repetir? Se precisar de ajuda com coisas da PDA, digite "ajuda" ou aguarde até que o Gemini responda!');
    }

    lastMessage = content; // atualizar o contexto antes de enviar a próxima solicitação

    const geminiResponse = await sendMessageToGemini(content);
    lastMessage += ` ${geminiResponse}`; // adicionar a resposta do Gemini ao contexto

    if (geminiResponse.length > 2000) {
        await sendSplitMessage(message.channel, geminiResponse);
    } else {
        message.channel.send(geminiResponse);
    }
}


client.on('ready', () => {
    console.log(`${client.user.tag} está online!`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    await handleDiscordMessage(message);
});


client.login(process.env.TOKEN);