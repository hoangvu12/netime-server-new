const path = require("path");
const axios = require("axios");
const { JSDOM } = require("jsdom");
const { LIMIT } = require("./constants");
const { toSlug, encodeString } = require("./utils");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const instance = axios.create({
  baseURL: process.env.API_URL,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Referer: "https://vuighe.net/idoly-pride",
  },
});

class Model {
  static async slide() {
    const URL = process.env.WEBSITE_URL;

    const { data } = await axios.get(URL);

    const { window } = new JSDOM(data);
    const { document } = window;

    const slideItems = document.querySelectorAll(".slider-item");

    const list = [...slideItems].map((item) => {
      const backgroundImage =
        item.querySelector(".slider-item-img").dataset.src;
      const title = item.dataset.title;
      const slug = toSlug(title);

      return { backgroundImage, slug };
    });

    return addInfo(list);
  }

  static async getEpisode(animeId, episodeIndex) {
    const episodes = await this.getEpisodes(animeId);

    const episode = episodes[episodeIndex];

    const sources = await this.getSource(animeId, episode.id);

    return { ...episode, ...sources };
  }

  static async search(keyword, limit = LIMIT) {
    const URL = `/search?q=${keyword}&limit=${limit}`;
    const { data } = await instance.get(URL);

    const list = data.data.map((anime) => {
      const { meta, time, ...info } = anime;

      const animeTime = !info.is_movie
        ? `${meta.max_episode_name}/${time}`
        : time;

      return { ...info, time: animeTime };
    });

    return { data: list, total: list.length };
  }

  static async getEpisodes(animeId) {
    const URL = `/films/${animeId}/episodes?sort=name`;
    const { data } = await instance.get(URL);

    const episodes = data.data.filter((episode) => !episode.special_name);

    return episodes;
  }

  static async getSource(animeId, episodeId) {
    const { data } = await instance.get(
      `/films/${animeId}/episodes/${episodeId}`
    );

    const m3u8Source = data.sources.m3u8;
    const source = m3u8Source.hls || m3u8Source.sd;

    const m3u8 = encodeString(source)
      .replace("vdicdn.com", "mephimanh.com")
      .split("/")[4];

    return {
      videoSource:
        "https://s9" + ".8giaitri.com/playlist/" + m3u8 + "/" + m3u8 + ".m3u8",
    };
  }

  static async getComments(animeId, offset, limit = LIMIT) {
    const { data } = await instance.get(
      `/films/${animeId}/comments?limit=${limit}&offset=${offset}`
    );

    return data.data;
  }

  static async getRanking(slug) {
    const { data } = await axios.get(
      `${process.env.WEBSITE_URL}/bang-xep-hang/${slug}`
    );

    return addInfo(parseList(data));
  }

  static async getInfo(slug) {
    const apiInfo = await getInfo(slug);
    const scrapedInfo = await scrapeInfo(slug);

    const episodes = await this.getEpisodes(apiInfo.id);

    return { ...apiInfo, ...scrapedInfo, episodes };
  }

  static async recentlyUpdated({ offset = 0, limit = LIMIT }) {
    const { data } = await instance.get("/films", {
      params: {
        sort: "-updated_at",
        limit,
        offset,
      },
    });

    return addInfo(data.data);
  }

  static async scrapeInfo(slug) {
    const { data } = await axios.get(`${process.env.WEBSITE_URL}/${slug}`);

    const { window } = new JSDOM(data);
    const { document } = window;

    const genresElement = document.querySelectorAll(".film-info-genre a");
    const subTeamsElement = document.querySelectorAll(".film-info-subteam a");

    const genres = [...genresElement].map((genre) => {
      const name = genre.textContent;
      const url = genre.getAttribute("href");
      const slug = urlToSlug(url);

      return { name, url, slug };
    });

    const subTeams = [...subTeamsElement].map((team) => team.textContent);

    const description = document.querySelector(
      ".film-info-description"
    ).textContent;

    return { genres, subTeams, description };
  }

  static async getGenre(genre, offset, limit = LIMIT) {
    const URL = `/films?genre=${genre}&limit=${limit}&offset=${offset}&sort=-updated_at`;

    const { data } = await instance.get(URL);

    // const list = await addInfo(data.data);

    return { data: data.data, total: data.total };
  }
}

const urlToSlug = (url) => {
  const parts = url.split("/");

  return parts[parts.length - 1];
};

const getInfo = async (slug) => {
  const { data } = await instance.get("/search", {
    params: {
      q: slug,
      limit: 1,
    },
  });

  const { meta, time, ...info } = data.data[0];

  const animeTime = !info.is_movie ? `${meta.max_episode_name}/${time}` : time;

  return { ...info, time: animeTime };
};

const addInfo = async (list) => {
  const promises = await Promise.allSettled(
    list.map(async (anime) => {
      const info = await getInfo(anime.slug);

      let returnObj = { ...anime, ...info };

      if (!anime.description) {
        const scrapedInfo = await scrapeInfo(anime.slug);
        returnObj = { ...returnObj, ...scrapedInfo };
      }

      return returnObj;
    })
  );

  return promises
    .filter((promise) => promise.status === "fulfilled")
    .map((promise) => promise.value);
};

const scrapeInfo = async (slug) => {
  const { data } = await axios.get(`${process.env.WEBSITE_URL}/${slug}`);

  const { window } = new JSDOM(data);
  const { document } = window;

  const genresElement = document.querySelectorAll(".film-info-genre a");
  const subTeamsElement = document.querySelectorAll(".film-info-subteam a");

  const genres = [...genresElement].map((genre) => {
    const name = genre.textContent;
    const url = genre.getAttribute("href");
    const slug = urlToSlug(url);

    return { name, url, slug };
  });

  const subTeams = [...subTeamsElement].map((team) => team.textContent);

  const description = document.querySelector(
    ".film-info-description"
  ).textContent;

  return { genres, subTeams, description };
};

const parseList = (html) => {
  const { window } = new JSDOM(html);
  const { document } = window;

  const items = document.querySelectorAll(".tray-item a");

  const list = [...items].map((item) => {
    const url = item.getAttribute("href");
    const slug = urlToSlug(url);

    return { slug };
  });

  return list;
};

module.exports = Model;
