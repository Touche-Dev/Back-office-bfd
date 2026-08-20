const express = require("express")
const cors = require("cors")
const mysql = require("mysql2/promise")
const app = express()
require("dotenv").config()
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY
const crypto = require("crypto");


app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

db.getConnection()
    .then(connection => {
        console.log("Connexion à la base de données réussie !");
        connection.release();
    })
    .catch(err => {
        console.error("Erreur de connexion :", err.message);
    });

function generateToken() {
    return "bfd_" + crypto.randomBytes(16).toString("hex");
}


app.listen(3006, () => {
    console.log(`Serveur en écoute`);
})


app.get("/token", (req, res) => {
    const token = jwt.sign(
        {},
        SECRET_KEY,
        { expiresIn: "1h" }
    );

    res.send(token);
});


app.get("/", (req, res) => {
    const sql = "SELECT * FROM admin";
    db.query(sql)
        .then(([rows]) => {
            res.send(rows);
        })
        .catch(err => {
            console.error("Erreur SQL :", err);
            res.status(500).send("Erreur serveur");
        });
});

app.get("/inscription", (req, res) => {
    const sql = "SELECT * FROM event_registrations ORDER BY created_at DESC";
    db.query(sql)
        .then(([rows]) => {
            res.send(rows);
        })
        .catch(err => {
            console.error("Erreur SQL :", err);
            res.status(500).send("Erreur serveur");
        });
});

app.post("/validation-inscrit", (req, res) => {
    const { token } = req.body

    const sql = "UPDATE event_registrations SET status = 'paid' WHERE token = ?"

    db.query(sql, [token])
        .then(([rows]) => {
            res.send("Mise à jour réussie !");
        })
        .catch(err => {
            console.error("Erreur SQL :", err);
            res.status(500).send("Erreur serveur");
        });
});


app.post("/inscrire", (req, res) => {
    const { payload } = req.body;

    if (!payload || typeof payload !== "object") {
        return res.json({ message: "ERREUR: Payload manquant ou invalide." });
    }

    const sujet = Array.isArray(payload.sujets) ? payload.sujets.join(",") : "";
    const token = generateToken();

    const checkSql = "SELECT 1 FROM event_registrations WHERE email = ? AND status = 'paid' LIMIT 1";

    db.query(checkSql, [payload.email])
        .then(([existing]) => {


            if (existing.length > 0) {
                return res.json({ message: "ERREUR: Cette adresse e-mail possède déjà une inscription validée ou traitée pour les Bangui Financial Days 2026." });
            }

            const insertSql = `
  INSERT INTO event_registrations
    (token, nom_prenom, date_naissance, nationalite, code_postal, ville, tel, email,
     organisation, fonction, secteur_activite, site_web, sujets_interet, b2b, besoin_specifique,
     payment_type, pass, days, prix, devise, mollie_payment_id, payment_id, payment_proof_path, status, email_sent)
  VALUES
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, ?, ?)
`;

            return db.query(insertSql, [
                token,                    // token
                payload.nom_prenom,       // nom_prenom
                payload.date_naissance,   // date_naissance
                payload.nationalite,      // nationalite
                payload.code_postal,      // code_postal
                payload.ville,             // ville
                payload.tel,                // tel
                payload.email,               // email
                payload.org,                 // organisation
                payload.fonction,            // fonction
                payload.secteur,             // secteur_activite
                payload.site_web,            // site_web
                sujet,                       // sujets_interet
                payload.b2b,                 // b2b
                payload.besoinspecifique,    // besoin_specifique
                "physique",                        // payment_type
                "Pass accès complet",        // pass
                3,                            // days
                "75000",                      // prix
                "FCFA",                        // devise
                "paid",                     // status
                0,                              // email_sent
            ]).then(([result]) => {
                if (result.affectedRows > 0) {
                    res.json({ message: "Inscription enregistrée avec succès.", token });
                } else {
                    res.json({ message: "ERREUR: Une erreur est survenue lors de l'enregistrement." });
                }
            });
        })
        .catch(err => {
            console.error("Erreur SQL :", err);
            res.json({ message: "ERREUR: Erreur serveur." });
        });
});

app.get("/contact", (req, res) => {
    const sql = "SELECT * FROM contact_messages";
    db.query(sql)
        .then(([rows]) => {
            res.send(rows);
        })
        .catch(err => {
            console.error("Erreur SQL :", err);
            res.status(500).send("Erreur serveur");
        });
});

app.get("/newsletter", (req, res) => {
    const sql = "SELECT * FROM newsletter_subscribers";
    db.query(sql)
        .then(([rows]) => {
            res.send(rows);
        })
        .catch(err => {
            console.error("Erreur SQL :", err);
            res.status(500).send("Erreur serveur");
        });
});

app.post("/newPassword", (req, res) => {
    const { mdp, role } = req.body

    const sql = "UPDATE admin SET password=? where role=?"

    db.query(sql, [mdp, role])
        .then(([rows]) => {
            res.send("Mise à jour réussie !");
        })
        .catch(err => {
            console.error("Erreur SQL :", err);
            res.status(500).send("Erreur serveur");
        });
});