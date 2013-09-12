var puzzleStatus = {ACTIVE: "active", SKIPPED: "skipped", SOLVED: "solved", INACTIVE: "inactive", ARCHIVED: "archived"};
var teamStatus = {DEAD: "dead"};
var locationStatus = {VISITED: "visited", SKIPPED: "skipped", CURRENT: "current", UNVISITED: "unvisited"};
var hintStatus = {LOCKED: "locked", AVAILABLE: "available", REVEALED: "revealed", SKIPPED: "skipped", FREE: "free"};
var answerTypes = {FINAL: "final", PARTIAL: "partial"};
var screenTypes = {MAIN: "main", PUZZLE: "puzzle"}; 
var resourceStatus = {LOCKED: "locked", UNLOCKED: "unlocked"};
var logTypes = {GAME: "game", PUZZLE: "puzzle", RESOURCE: "resource", KILL: "kill", MESSAGE: "message", STORY: "story"};
var deathVolume = {QUIET: true, LOUD: false}
var timeFormat = {TWENTYFOUR: "twentyfour", TWELVE: "twelve"}

var data_dir = "Resources/data/";

var timeInterval = 1000;