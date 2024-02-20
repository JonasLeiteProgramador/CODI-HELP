
import { Client, IntentsBitField } from "discord.js";
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]
});

const saudacoes = ['ola', 'oi', 'e ai', 'bom dia', 'boa tarde', 'boa noite', 'opa','eai','eae','Olá'];
const perguntas = ['tudo bem?','tudo bom?','como você ta?']


const acoes = {
     saudacoes: () => 'Ola! , prazer Codi Help, como posso te ajudar hoje?',
    'mini mapa de softskils': () =>  ({text:'Aqui esta seu mini-mapa de softkils!', files: ['./mapas/mapaSt.pdf'] }),
    'mini mapa de ingles': () => ( {text:'Aqui esta seu mini-mapa de inglês!', files: ['./mapas/mapaIn.pdf'] }),
    'mini mapa de programação': () => ({text:'Aqui esta seu mini-mapa de programação!',files: ['./mapas/mapaPg.pdf'] }),
    'cronograma': () => ({text:'Aqui está o nosso crongrama!',files:['./cronogramas/cronograma.pdf']}),
    'arremate': () => ({text:'Aqui está o link de todos os arremates:https://classroom.google.com/c/NjUwOTIxNjM3MDIx/m/NjUzNDI2MDYyNTYz/details'}),
    'justificar': () => ({text:'Justifique aqui a sua falta!, https://docs.google.com/forms/d/e/1FAIpQLSflcGYDbsk38oDfYteGEnm8aKzUw8c14jYbFpSIXvQu0eA3Lw/viewform'}),
    'ajuda': () => 'Vi que você pediu uma ajuda!,sou capaz de fazer de tudo para te ajudar a se guiar neste curso!,precisa do mini-mapa de programação basta escrever mini-mapa seguido pelo nome da matéria!,quer o cronograma?,basta escrever cronograma,precisa justificar sua falta?,escreva justificativa em sua frase,quer os deveres escreva arremate ',
    perguntas: () => 'Estou ótimo!,e você?,mas devo resaltar que maquinas não sentem nada viu! -_-'
};



client.on('ready', () => {
    console.log(`${client.user.tag} está online!`);
});


client.on('messageCreate', message => {
    if (message.author.bot) return;

    const content = message.content.toLowerCase();
     
    if (content.includes('ajuda')) {
        const response = acoes['ajuda']();
        message.channel.send(response);
        return;
    }

    let foundAction = false;
    for (const keyword in acoes) {
        if (keyword === 'saudacoes') {
            if (saudacoes.some(saudacao => content.includes(saudacao))) {
                const response = acoes[keyword]();
                message.channel.send(response);
                foundAction = true;
                break;
            }
        } else if (keyword === 'perguntas') {
            if (perguntas.some(pergunta => content.includes(pergunta))) {
                const response = acoes[keyword]();
                message.channel.send(response);
                foundAction = true;
                break;
            }
        } else if (content.includes(keyword)) {
            const response = acoes[keyword]();
            message.channel.send(response.text);
            if (response.files)
                message.channel.send(response);
            foundAction = true;
            break;
        }
    }
    if (!foundAction) {
        message.channel.send('Não entendi muito bem, poderia repetir? Se precisar de ajuda, digite "ajuda".');
    }
});


client.login(process.env.TOKEN)