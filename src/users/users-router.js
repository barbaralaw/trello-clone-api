const express = require("express");
const path = require("path");
const UsersService = require("./users-service");

const usersRouter = express.Router();
const jsonBodyParser = express.json();

usersRouter.post("/", jsonBodyParser, (req, res, next) => {
  const { email, password } = req.body;
  for (const field of ["email", "password"])
    if (!req.body[field])
      return res
        .status(400)
        .json({ error: `Missing '${field}' in request body` });

  const passwordError = UsersService.validatePassword(password);
  if (passwordError) return res.status(400).json({ error: passwordError });

  UsersService.containsUserWithEmailAddress(req.app.get("db"), email)
    .then((hasEmailAddress) => {
      if (hasEmailAddress)
        return res.status(400).json({ error: "Email already taken" });

      return UsersService.hashPassword(password).then((hashedPassword) => {
        const newUser = {
          email,
          password: hashedPassword,
          date_created: "now()",
        };

        return UsersService.insertUser(req.app.get("db"), newUser).then(
          (user) => {
            res
              .status(201)
              .location(path.posix.join(req.originalUrl, `/${user.id}`))
              .json(UserService.serializeUser(user));
          }
        );
      });
    })

    .catch(next);
});

module.exports = usersRouter;
