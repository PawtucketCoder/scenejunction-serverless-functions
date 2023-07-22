import dotenv from "dotenv";
import mysql from 'mysql';

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: 3306,
  acquireTimeout: 1000000,
  connectTimeout: 300000
});

export const handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const username = body.username;
        
        // Check if the user already exists in the database
        const existingUser = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM users WHERE username=?', [username],
                function (err, results, fields) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results);
                    }
                }
            );
        });

        if (existingUser.length > 0) {
            // User already exists, return an error
            return {
                statusCode: 409,
                body: JSON.stringify({ message: "Username already exists" })
            };
        } else {
            // Insert the new user into the database
            const newUser = await new Promise((resolve, reject) => {
                db.query('INSERT INTO users (username) VALUES (?)', [username],
                    function (err, results, fields) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(results);
                        }
                    }
                );
            });

            return {
                statusCode: 200,
                body: JSON.stringify({ message: "User inserted successfully" })
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify(error)
        };
    }
};
