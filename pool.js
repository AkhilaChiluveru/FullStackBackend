const Pool = require("pg").Pool;
const moment = require("moment");
const connectionString = "postgres://postgres:postgrespw@localhost:55000";

const pool = new Pool({ connectionString });

// const pool = new Pool({
//   user: "me",
//   host: "postgres://postgres:postgrespw@localhost:55000",
//   database: "Events",
//   password: "postgrespw",
//   port: 55000,
// });

const getUsers = (request, response) => {
  pool.query("SELECT * FROM users ORDER BY id ASC", (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getUserByUsername = (request, response) => {
  const { username, password } = request.query;
  console.log(request.query);
  pool.query(
    "SELECT count(username) FROM users WHERE username = $1 and password=$2",
    [username, password],
    (error, results) => {
      if (error) {
        throw error;
      }

      console.log(results.rows);
      const { count } = results.rows[0];
      if (parseInt(count, 10) === 0) {
        response
          .status(200)
          .json({ response: "user does not exist", error: { isError: true } });
      }
      if (parseInt(count, 10) >= 1) {
        response.status(200).json({
          response: "successfully authenticated",
          error: { isError: false },
        });
      }
      //   response.status(200).json(results.rows);
    }
  );
};

const createUser = (request, response) => {
  const { username, password } = request.body;
  let email = "placeholder";
  let created_on = moment.utc();
  let last_login = moment.utc();

  pool.query(
    "INSERT INTO users (username, password, created_on, last_login) VALUES ($1, $2, $3, $4)",
    [username, password, created_on, last_login],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`User added with ID: ${results.insertId}`);
    }
  );
};

const updateUser = (request, response) => {
  const id = parseInt(request.params.id);
  const { name, email } = request.body;

  pool.query(
    "UPDATE users SET name = $1, email = $2 WHERE id = $3",
    [name, email, id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`User modified with ID: ${id}`);
    }
  );
};

const deleteUser = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query("DELETE FROM users WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(`User deleted with ID: ${id}`);
  });
};

module.exports = {
  getUsers,
  getUserByUsername,
  createUser,
  updateUser,
  deleteUser,
};
