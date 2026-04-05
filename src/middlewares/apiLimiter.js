const rateLimitStore = {};

const apiLimiter=(req, res, next)=> {
    const ip = req.ip;
    const currentTime = Date.now();
    const windowTime = 60 * 1000;
    const limit=500;

    if (!rateLimitStore[ip]) {
        rateLimitStore[ip] = [];
    }

    rateLimitStore[ip] = rateLimitStore[ip].filter(
        timestamp => currentTime - timestamp < windowTime
    );

    if (rateLimitStore[ip].length >= limit) {
        return res.status(429).send("Too many requests");
    }

    rateLimitStore[ip].push(currentTime);
    next();
}

module.exports=apiLimiter;