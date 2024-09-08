module.exports = {
    LevelInfo: class LevelInfo {
        getLevelFromXP(xp) {
            return Math.ceil((xp - 50) / (	100 * 1.5));
        }
        getMaxXP(level) {
            return 50 + 100 * (level) * 1.5;
        }
    }
}