const Pool = require("pg").Pool;
const moment = require("moment");
const connectionString =
  "postgresql://postgres:postgrespw@host.docker.internal:5433/events";
// const connectionString = "postgres://postgres/postgres";
const pool = new Pool({ connectionString });

// const pool = new Pool({
//   user: "postgres",
//   host: "localhost",
//   database: "public",
//   password: "postgrespw",
//   port: 5433,
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
    "SELECT user_id, username FROM users WHERE username = $1 and password=$2",
    [username, password],
    (error, results) => {
      if (error) {
        throw error;
      }

      console.log(results.rows);
      let savedUsername;
      let savedUserID;
      if (results.rows.length) {
        // const { username } = results.rows[0];
        savedUsername = results.rows[0].username;
        savedUserID = results.rows[0].user_id;
      }
      if (results.rows.length === 0) {
        response
          .status(200)
          .json({ response: "user does not exist", error: { isError: true } });
      }
      if (savedUsername === username) {
        response.status(200).json({
          response: "successfully authenticated",
          data: {
            userId: savedUserID,
          },
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

const getEvents = (request, response) => {
  const id = parseInt(request.params.id);
  const { name, email } = request.body;

  pool.query(
    `select events.event_id,events.event_name,events.url, venue.name,venue.postal_code, venue_address.address_line_1
  from events 
  inner join venue on events.venue_id = venue.id
  inner join venue_address  on venue.id=venue_address.address_id`,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json({ data: results.rows });
    }
  );
};

const saveWhishlist = (request, response) => {
  const { user_id, event_id } = request.body;
  console.log(user_id, event_id);
  pool.query(
    `INSERT INTO whishlist (user_id,event_id) VALUES ($1, $2)`,
    [user_id, event_id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json({ data: results.rows });
    }
  );
};

const savePurchase = (request, response) => {
  const { user_id, event_id } = request.body;
  console.log(user_id, event_id);
  pool.query(
    `INSERT INTO purchased (user_id,event_id) VALUES ($1, $2)`,
    [user_id, event_id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json({ data: results.rows });
    }
  );
};

const getPurchase = (request, response) => {
  const { user_id } = request.query;
  console.log("data", user_id);
  pool.query(
    `select events.event_id , events.event_name, events.url, venue_address.address_line_1, venue.postal_code
    from events INNER JOIN purchased on events.event_id=purchased.event_id 
    INNER JOIN venue on events.venue_id = venue.id
    INNER JOIN venue_address on venue.id=venue_address.address_id
    where purchased.user_id=$1`,
    [user_id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json({ data: results.rows });
    }
  );
};

const getWhishlist = (request, response) => {
  const { user_id } = request.query;
  console.log("data", user_id);
  pool.query(
    `select whishlist.whishlist_id,events.event_id , events.event_name, events.url, venue_address.address_line_1,venue.postal_code
    from events INNER JOIN whishlist on events.event_id=whishlist.event_id 
    INNER JOIN venue on events.venue_id = venue.id
    INNER JOIN venue_address on venue.id=venue_address.address_id
    where whishlist.user_id=$1`,
    [user_id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json({ data: results.rows });
    }
  );
};

const removeWhishlist = (request, response) => {
  const { id } = request.body;
  console.log("data", id);
  pool.query(
    `delete from whishlist where whishlist_id=$1`,
    [id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json({ data: results.rows });
    }
  );
};

// const getEvents = () => {
//   //     select events.event_name,events.url, venue.name,venue.postal_code, venue_address.address_line_1
//   // from events
//   // inner join venue on events.venue_id = venue.id
//   // inner join venue_address  on venue.id=venue_address.address_id

//   pool.query("", [id], (error, results) => {
//     if (error) {
//       throw error;
//     }
//     response.status(200).send(`User deleted with ID: ${id}`);
//   });
// };

module.exports = {
  getUsers,
  getUserByUsername,
  createUser,
  updateUser,
  getEvents,
  saveWhishlist,
  savePurchase,
  getPurchase,
  getWhishlist,
  removeWhishlist,
};
