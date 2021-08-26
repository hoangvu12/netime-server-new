const corsAnywhere = require("cors-anywhere");

const { LIMIT } = require("./constants");
const Model = require("./model");
const { pageToPagination } = require("./utils");

let proxy = corsAnywhere.createServer({
  originWhitelist: [],
  requireHeaders: [],
  removeHeaders: [],
  setHeaders: {
    referer: "https://vuighe.net/",
  },
});

class Controller {
  static async getRecentlyUpdated(_req, res, next) {
    try {
      const recentlyUpdatedList = await Model.recentlyUpdated();

      res.json({ success: true, data: recentlyUpdatedList });
    } catch (err) {
      next(err);
    }
  }

  static async getInfo(req, res, next) {
    const { slug } = req.params;

    try {
      const info = await Model.getInfo(slug);

      res.json({ success: true, data: info });
    } catch (err) {
      next(err);
    }
  }

  static async getEpisode(req, res, next) {
    const { animeId, episodeIndex } = req.params;

    try {
      const episode = await Model.getEpisode(animeId, episodeIndex);

      res.json({ success: true, data: episode });
    } catch (err) {
      next(err);
    }
  }

  static async getEpisodes(req, res, next) {
    const { animeId } = req.params;

    try {
      const episodes = await Model.getEpisodes(animeId);

      res.json({ success: true, data: episodes });
    } catch (err) {
      next(err);
    }
  }

  static async getComments(req, res, next) {
    const { animeId, limit } = req.params;
    const { page } = req.query;

    const { offset } = pageToPagination(page);

    try {
      const comments = await Model.getComments(animeId, offset, limit);

      res.json({ success: true, data: comments });
    } catch (err) {
      next(err);
    }
  }

  static async getGenre(req, res, next) {
    const { slug } = req.params;
    const { page = 1, limit } = req.query;

    try {
      const { data, total } = await Model.getGenre(slug, page);

      res.json({
        success: true,
        data,
        pagination: totalToPagination(total, page, limit),
      });
    } catch (err) {
      next(err);
    }
  }

  static async search(req, res, next) {
    const { q, limit, page = 1 } = req.query;

    try {
      const { data, total } = await Model.search(q, limit);

      res.json({
        success: true,
        data,
        pagination: totalToPagination(total, page, limit),
      });
    } catch (err) {
      next(err);
    }
  }

  static async getSlide(_req, res, next) {
    try {
      const slideList = await Model.slide();

      res.json({ success: true, data: slideList });
    } catch (err) {
      next(err);
    }
  }

  static async getRecommended(_req, res, next) {
    try {
      const recommendedList = await Model.recommended();

      res.json({ success: true, data: recommendedList });
    } catch (err) {
      next(err);
    }
  }

  static async getRanking(req, res, next) {
    const { slug } = req.params;

    try {
      const rankingList = await Model.getRanking(slug);

      res.json({ success: true, data: rankingList });
    } catch (err) {
      next(err);
    }
  }

  static async corsAnywhere(req, res) {
    req.url = req.url.replace("/cors/", "/");
    proxy.emit("request", req, res);
  }
}

const totalToPagination = (total, page, limit = LIMIT) => {
  return {
    currentPage: Number(page),
    totalPage: Math.round(total / limit),
  };
};
module.exports = Controller;
