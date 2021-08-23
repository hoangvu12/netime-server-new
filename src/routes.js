const express = require("express");
const controller = require("./controller");
const router = express.Router();

router.get("/recently", controller.getRecentlyUpdated);
router.get("/recommended", controller.getRecommended);
router.get("/slide", controller.getSlide);
router.get("/search", controller.search);

router.get("/cors/:proxyUrl*", controller.corsAnywhere);
router.get("/ranking/:slug", controller.getRanking);
router.get("/anime/:slug", controller.getInfo);
router.get("/genres/:slug", controller.getGenre);
router.get("/anime/:animeId/episodes", controller.getEpisodes);
router.get("/anime/:animeId/episodes/:episodeIndex", controller.getEpisode);
router.get("/anime/:animeId/comments", controller.getComments);

module.exports = router;
