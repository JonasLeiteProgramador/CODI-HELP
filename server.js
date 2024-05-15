import pkg from "discord.js";
const {
  Client,
  IntentsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = pkg;
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();


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

let currentBot = 'pda'
  
  const perguntas = [
    'tudo bem?', 'tudo bom?', 'como você tá?', 'tá tudo bem?', 'tá tudo bom?', 'como está você?', 'está tudo bem?',
    'TUDO BEM?', 'TUDO BOM?', 'COMO VOCÊ TÁ?', 'TÁ TUDO BEM?', 'TÁ TUDO BOM?', 'COMO ESTÁ VOCÊ?', 'ESTÁ TUDO BEM?',
    'Tudo bem?', 'Tudo bom?', 'Como você tá?', 'Tá tudo bem?', 'Tá tudo bom?', 'Como está você?', 'Está tudo bem?',
    'tUdO bEm?', 'tUdO bOm?', 'cOmO vOcÊ tÁ?', 'tÁ tUdO bEm?', 'tÁ tUdO bOm?', 'cOmO eStÁ vOcÊ?', 'eStÁ tUdO bEm?',
    'Tudo Bem?', 'Tudo Bom?', 'Como Você Tá?', 'Tá Tudo Bem?', 'Tá Tudo Bom?', 'Como Está Você?', 'Está Tudo Bem?'
];


const actions = {
    saudacoes: () => 'Olá! Prazer, Codi Help. Como posso te ajudar hoje?',
    'mini mapa de softskills': () => ({ text: 'Aqui está o seu mini-mapa de habilidades sociais!', files: ['./mapas/mapaSt.pdf'] }),
    'mini mapa de inglês': () => ({ text: 'Aqui está o seu mini-mapa de inglês!', files: ['./mapas/mapaIn.pdf'] }),
    'mini mapa de programação': () => ({ text: 'Aqui está o seu mini-mapa de programação!', files: ['./mapas/mapaPg.pdf'] }),
    'cronograma': () => ({ text: 'Aqui está o nosso cronograma!', files: ['./cronogramas/cronograma.pdf'] }),
    'arremate': () => ({ text: 'Aqui está o link de todos os arremates: https://classroom.google.com/c/NjUwOTIxNjM3MDIx/m/NjUzNDI2MDYyNTYz/details' }),
    'justificar': () => ({ text: 'Justifique aqui a sua falta: https://docs.google.com/forms/d/e/1FAIpQLSflcGYDbsk38oDfYteGEnm8aKzUw8c14jYbFpSIXvQu0eA3Lw/viewform' }),
    'ajuda': () => 'Vi que você pediu uma ajuda! Sou capaz de fazer de tudo para te ajudar a se guiar neste curso! Precisa do mini mapa de programação? Basta escrever "mini mapa de "  => seguido pelo nome da matéria! Quer o cronograma? Basta escrever "cronograma"! Precisa justificar sua falta? Escreva "justificar" em sua frase. Quer os deveres? Escreva "arremate".',
    perguntas: () => 'Estou ótimo! E você? Mas devo ressaltar que máquinas não sentem nada, viu! -_-'
}











// Função para enviar uma mensagem dividida em partes menores para evitar exceder o limite de caracteres.
async function sendSplitMessage(channel, message) {
    // Enquanto houver caracteres na mensagem para enviar:
    while (message.length > 0) {
        // Extrai uma parte da mensagem com no máximo 1999 caracteres.
        const part = message.substring(0, 1999);
        // Remove a parte já enviada da mensagem original.
        message = message.substring(1999);
        // Envia a parte da mensagem para o canal.
        await channel.send(part);
    }
}

// Função para enviar uma mensagem para o Gemini (supondo que seja um serviço externo).
async function sendMessageToGemini(message) {
    try {
        if (message.author.bot) return;
        const content = message.content.toLowerCase();
        console.log(content)

        
      // Verifica se a mensagem excede o limite de caracteres permitido.
      if (content.length > 2000) {
        throw new Error("Limite de caracteres excedido.");
      }
   
      // Gera o conteúdo da mensagem usando um modelo/modelo externo.
      const result = await model.generateContent(content);

      // Extrai a resposta do modelo, limitando-a a 2000 caracteres.
      const response = result.response.text().substring(0, 2000);
      return message.channel.send(response);   // Retorna a resposta gerada.
    } catch (error) {
      // Em caso de erro, registra o erro no console.
      console.error("Erro ao enviar mensagem para o Gemini:", error);
      // Retorna uma mensagem padrão em caso de erro.
      return "Desculpe, o Gemini por algum motivo não conseguiu responder sua pergunta. Por favor, poderia reformulá-la?.";
    }
  }

async function handleDiscordMessage(message) {
    // Verifica se o autor da mensagem é um bot, e se for, retorna sem fazer nada.
   
    // Converte o conteúdo da mensagem para minúsculas para facilitar a comparação.
    const content = message.content.toLowerCase();

    // Verifica se a mensagem contém a palavra "ajuda".
    if (content.includes('ajuda')) {
        // Se a mensagem contiver "ajuda", chama a função correspondente e envia a resposta para o canal.
        const response = actions['ajuda']();
        message.channel.send(response);
        return;
    }

    // Variável para controlar se uma ação foi encontrada ou não.

    // Percorre as chaves (palavras-chave) no objeto de ações.
    for (const keyword in actions) {
        if (keyword === 'saudacoes') {
            // Verifica se a mensagem contém uma saudação definida no array 'saudacoes'.
            if (saudacoes.some(saudacao => content.includes(saudacao))) {
                // Se contiver, chama a função correspondente e envia a resposta para o canal.
                const response = actions[keyword]();
                message.channel.send(response);
                return; //Sai do loop, pois uma ação foi encontrada isso evita que o gemini responda.
            }
        } else if (keyword === 'perguntas') {
            // Verifica se a mensagem contém uma pergunta definida no array 'perguntas'.
            if (perguntas.some(pergunta => content.includes(pergunta))) {
                // Se contiver, chama a função correspondente e envia a resposta para o canal.
                const response = actions[keyword]();
                message.channel.send(response);
                return; // Sai do loop, pois uma ação foi encontrada isso evita que o gemini responda.
            }
        } else if (content.includes(keyword)) {
            // Verifica se a mensagem contém a palavra-chave.
            const response = actions[keyword]();
            // Envia a resposta de texto para o canal.
            message.channel.send(response.text);
            // Se houver arquivos a serem enviados na resposta, envia-os para o canal.
            if (response.files)
                message.channel.send(response);
            return; // Sai do loop, pois uma ação foi encontrada.
        }
    }
    
   

   
   
}

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
  
    // Cria o botão de alternância
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("toggle")
        .setLabel("Alternar Bot")
        .setStyle(ButtonStyle.Danger)
    );
  
    // Envia basicamente uma mensagem com o botão de alternância
    await message.channel.send({
      content: `você esta utilizando o  bot ${currentBot}  Clique para alternar caso desejar.`,
      components: [row],
    });
    if(currentBot === 'pda'){
        await handleDiscordMessage(message)
    }else{
       await sendMessageToGemini(message)
    }
  });
  
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;
  
    if (interaction.customId === "toggle") {
      // basicamente alterna entre 'gemini' e 'pda'
      currentBot = currentBot === "gemini" ? "pda" : "gemini";
  
      // aqui ele atualiza a mensagem para refletir o estado atual
      await interaction.update({
        content: `Bot alterado para: ${currentBot}`,
        components: [],
      });


      const lastMessage = interaction.channel.messages.cache.last();
      if (currentBot === "gemini") {
          interaction.channel.send("Olá eu sou o gemini no que posso te ajudar?")
          await sendMessageToGemini(lastMessage)
    
      } else {
        interaction.channel.send(
          "Olá eu sou o CodiHelp e será um prazer te ajudar em coisas da PDA no que posso te ajudar?"
        );
         await handleDiscordMessage(lastMessage)        
      }
    }
  });

// colocamos o bot online e exibimos uma mensagem para indicar isso
client.on('ready', () => {
    console.log(`${client.user.tag} está online!`);
});




client.login(process.env.TOKEN);