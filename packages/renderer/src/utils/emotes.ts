const fetchUrl = (url: string) => fetch(url, {
  method: "GET",
  headers: {
    "User-Agent": "chatting-client",
  }
}).then(res => res.json(), err => console.error(err));

export interface Emote {
  emoteName: string;
  emoteURL: string;
}

export async function fetchEmotesForChannel(channel: string) {
  const proxyurl = "https://tpbcors.herokuapp.com/";
  let twitchID: string = "";
  let totalErrors = [];
  let emotes: Emote[] = []

  // get channel twitch ID
  let res = await fetchUrl(proxyurl + "https://api.ivr.fi/twitch/resolve/" + channel);
  if (!res.error || res.status == 200) {
    twitchID = res.id;
  } else {
    totalErrors.push("Error getting twitch ID");
  }

  // get FFZ emotes
  res = await fetchUrl(proxyurl + "https://api.frankerfacez.com/v1/room/" + channel);
  if (!res.error) {
    let setName = Object.keys(res.sets);
    for (var k = 0; k < setName.length; k++) {
      for (var i = 0; i < res.sets[setName[k]].emoticons.length; i++) {
        const emoteURL = res.sets[setName[k]].emoticons[i].urls["2"]
          ? res.sets[setName[k]].emoticons[i].urls["2"]
          : res.sets[setName[k]].emoticons[i].urls["1"];
        let emote = {
          emoteName: res.sets[setName[k]].emoticons[i].name,
          emoteURL: "https://" + emoteURL.split("//").pop(),
        };
        emotes.push(emote);
      }
    }
  } else {
    totalErrors.push("Error getting ffz emotes");
  }
  // get all global ffz emotes
  res = await fetchUrl(proxyurl + "https://api.frankerfacez.com/v1/set/global");
  if (!res.error) {
    let setName = Object.keys(res.sets);
    for (var k = 0; k < setName.length; k++) {
      for (var i = 0; i < res.sets[setName[k]].emoticons.length; i++) {
        const emoteURL = res.sets[setName[k]].emoticons[i].urls["2"]
          ? res.sets[setName[k]].emoticons[i].urls["2"]
          : res.sets[setName[k]].emoticons[i].urls["1"];
        let emote = {
          emoteName: res.sets[setName[k]].emoticons[i].name,
          emoteURL: "https://" + emoteURL.split("//").pop(),
        };
        emotes.push(emote);
      }
    }
  } else {
    totalErrors.push("Error getting global ffz emotes");
  }
  // get all BTTV emotes
  res = await fetchUrl(proxyurl + "https://api.betterttv.net/3/cached/users/twitch/" + twitchID);
  if (!res.message) {
    for (var i = 0; i < res.channelEmotes.length; i++) {
      let emote = {
        emoteName: res.channelEmotes[i].code,
        emoteURL: `https://cdn.betterttv.net/emote/${res.channelEmotes[i].id}/2x`,
      };
      emotes.push(emote);
    }
    for (var i = 0; i < res.sharedEmotes.length; i++) {
      let emote = {
        emoteName: res.sharedEmotes[i].code,
        emoteURL: `https://cdn.betterttv.net/emote/${res.sharedEmotes[i].id}/2x`,
      };
      emotes.push(emote);
    }
  } else {
    totalErrors.push("Error getting bttv emotes");
  }
  // global bttv emotes
  res = await fetchUrl(proxyurl + "https://api.betterttv.net/3/cached/emotes/global")
  if (!res.message) {
    for (var i = 0; i < res.length; i++) {
      let emote = {
        emoteName: res[i].code,
        emoteURL: `https://cdn.betterttv.net/emote/${res[i].id}/2x`,
      };
      emotes.push(emote);
    }
  } else {
    totalErrors.push("Error getting global bttv emotes");
  }

  // get all 7TV Emotes
  res = await fetchUrl(proxyurl + `https://api.7tv.app/v2/users/${channel}/emotes`);

  if (!res.error || res.status == 200) {
    if (res.Status === 404) {
      totalErrors.push("Error getting 7tv emotes");
    } else {
      for (var i = 0; i < res.length; i++) {
        let emote = {
          emoteName: res[i].name,
          emoteURL: res[i].urls[1][1],
        };
        emotes.push(emote);
      }
    }
  } else {
    totalErrors.push("Error getting 7tv emotes");
  }

  // get all global 7TV Emotes
  res = await fetchUrl(proxyurl + `https://api.7tv.app/v2/emotes/global`);
  if (!res.error || res.status == 200) {
    if (res.Status === 404) {
      totalErrors.push("Error getting 7tv global emotes");
    } else {
      for (var i = 0; i < res.length; i++) {
        let emote = {
          emoteName: res[i].name,
          emoteURL: res[i].urls[1][1],
        };
        emotes.push(emote);
      }
    }
  } else {
    totalErrors.push("Error getting 7tv global emotes");
  }
  try {

    let channelEmotes = await api.chat.getChannelEmotes(twitchID);
    let globalEmotes = await api.chat.getGlobalEmotes();
    // let subEmotes = await api.chat.getEmotesFromSets(user.)
    let twitchEmotes = [...channelEmotes, ...globalEmotes];
    for (var i = 0; i < twitchEmotes.length; i++) {
      let emote = {
        emoteName: twitchEmotes[i].name,
        emoteURL: twitchEmotes[i].getImageUrl(4),
      };
      emotes.push(emote);
    }
  } catch (e) {
    totalErrors.push("Error getting user:" + e);
  }

  emotes.sort((a, b) => a.emoteName.localeCompare(b.emoteName));


  return emotes;

}
