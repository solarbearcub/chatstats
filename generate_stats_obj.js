import result from './ChatExport_2024-02-17 (3)/result.json' assert { type: 'json' };

const getMonth = (month) => result.messages.filter(message => new Date(message.date).getUTCMonth() === month);

const getAverageByHour = (messages) => {
  const hours = Array(24).fill(0);
  messages.forEach(message => hours[new Date(message.date).getUTCHours()] += 1);
  return hours;
};

const getMessageById = (id, messages) => messages.filter(message => message.id === id);

const condenseText = (message) => {
  if(typeof message.text != "string") {
    return message.text.map(text => {
      if(typeof text === "string") {
        return text;
      }
      if(text.type === "text_link") {
        return text.href;
      }
      return text.text;
    }).join('');
  }
  return message.text;
}

const getMostCommonFiftyWords = messages => {
  const words = {};
  const dumpWords = [
    "",
    "~",
    "the",
    "karma",
    "there",
    "by",
    "you",
    "is",
    "don't",
    "that's",
    "not",
    "when",
    "an",
    "make",
    "it's",
    "me",
    "they",
    "he",
    "why",
    "what",
    "who",
    "when",
    "how",
    "this",
    "do",
    "have",
    "him",
    "with",
    "at",
    "and",
    "so",
    "if",
    "than",
    "but",
    "about",
    "in",
    "on",
    "the",
    "was",
    "for",
    "that",
    "said",
    "a",
    "or",
    "of",
    "to",
    "there",
    "will",
    "be",
    "what",
    "get",
    "go",
    "think",
    "just",
    "every",
    "are",
    "it",
    "were",
    "had",
    "i",
    "very",
    "my",
    "your",
    "out",
    "up",
    "them",
    "their",
    "oh",
    "has",
    "can",
    "as",
    "we",
    "would",
    "then",
    "you're",
    "i'm",
    "too",
    "its",
    "because",
    "even",
    "something",
    "much",
    "thing",
    "u",
    "im",
    "[forwarded",
    "like",
    "been",
    "from"
  ];

  messages.forEach(message => {
    const lowered = condenseText(message).toLowerCase().split(' ').filter(word => !dumpWords.includes(word));
    lowered.forEach(word => {
      if(word in words) {
        words[word] = words[word] + 1;
      } else {
        words[word] = 1;
      }
    });
  });

  const items = Object.keys(words).map(key => [key, words[key]]);
  items.sort(
    (first, second) => { return second[1] - first[1] }
  );

  return items.slice(0, 50);
};

const getMostReplied = (messages) => {
  const messagesByReplies = {};
  messages
  .filter(message => "reply_to_message_id" in message)
  .forEach(message => {
    const text = condenseText(message);
    if(text === '') {
      return;
    }
    if(message.reply_to_message_id in messagesByReplies) {
      messagesByReplies[message.reply_to_message_id].score += 1
    } else {
      const originalMessage = getMessageById(message.reply_to_message_id, messages);
      if(
        originalMessage === undefined || 
        originalMessage.length === 0 || 
        originalMessage[0].text === '') {
        return;
      }
      messagesByReplies[message.reply_to_message_id] = { text: condenseText(originalMessage[0]), score: 1 };
    }
  })

  const items = Object.keys(messagesByReplies).map(key => [messagesByReplies[key].text, messagesByReplies[key].score]);
  items.sort(
    (first, second) => { return second[1] - first[1] }
  );
  return items.slice(0, 10);
}

const getStats = (month = 0) => {
  const monthly = getMonth(month);
  const hourlyAverage = getAverageByHour(monthly);
  const top50words = getMostCommonFiftyWords(monthly);
  const mostReplied = getMostReplied(monthly);

  const smilies = ['😁','😌','😊','🙂','😄',':)'];
  const saddies = ['😔','😭','😕','☹️','😞',':('];
  const numberContainingSmilies = monthly.filter(message => smilies.some(smile => condenseText(message).includes(smile))).length;
  const numberContainingSaddies = monthly.filter(message => saddies.some(sad => condenseText(message).includes(sad))).length;
  const numberContainingQuestions = monthly.filter(message => condenseText(message).endsWith('?')).length;
  const numberYelling = monthly.filter(message => condenseText(message).endsWith('!')).length;
  const numberInFullcaps = monthly.filter(message => condenseText(message) === condenseText(message).toUpperCase()).length;
  const numberOfAdminMessages = monthly.filter(message => condenseText(message).endsWith('~admins')).length;
  const numberOfModMessages = monthly.filter(message => condenseText(message).endsWith('~mods')).length;
  const numberContainingImages = monthly.filter(message => "photo" in message).length;
  const numberContainingVideos = monthly.filter(message => "media_type" in message && message.media_type === "video_file").length;
  const numberContainingGifs = monthly.filter(message => "media_type" in message && message.media_type === "animation").length;
  const numberContainingStickers = monthly.filter(message => "media_type" in message && message.media_type === "sticker").length;
  const numberContainingMusic = monthly.filter(message => "media_type" in message && message.media_type === "audio_file").length;
  const numberContainingVoice = monthly.filter(message => "media_type" in message && message.media_type === "voice_message").length;

  return {
    name: result.name,
    messageVolume: monthly.length,
    hourlyAverage,
    top50words,
    mostReplied,
    smilies: numberContainingSmilies,
    saddies: numberContainingSaddies,
    questions: numberContainingQuestions,
    yelled: numberYelling,
    fullcap: numberInFullcaps,
    adminMessages: numberOfAdminMessages,
    modMessages: numberOfModMessages,
    media: {
      images: numberContainingImages,
      gifs: numberContainingGifs,
      videos: numberContainingVideos,
      stickers: numberContainingStickers,
      music: numberContainingMusic,
      voice: numberContainingVoice
    }
  };
}

console.dir(getStats(0), {depth: null});