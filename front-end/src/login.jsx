import React from 'react'
import { FaUser } from "react-icons/fa6";
import { GiUnlocking } from "react-icons/gi";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import Swal from "sweetalert2";
import { useEffect } from 'react';
import { jwtDecode } from "jwt-decode";

export default function Login() {
    const navigation = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (localStorage.getItem("admin#token") == null) {

        } else {
            navigation("/sidebar/dashboard")
        }
    }, []);


    async function submit(e) {
        e.preventDefault()

        if (submitting) return; // sécurité contre les doubles clics

        try {
            setSubmitting(true);

            const res = await axios.get("http://localhost:3006/");

            const result = res.data.filter((user) => user.email === email && user.password === password)

            if (result.length === 0) {
                Swal.fire({
                    title: "Erreur",
                    text: "Email ou mot de passe incorrect",
                    icon: "error",
                    confirmButtonText: "OK",
                    background: "#123779",
                    customClass: {
                        confirmButton: "my-confirm-btn",
                        title: "swal-title",
                        htmlContainer: "swal-text"
                    },
                    buttonsStyling: false
                });
                return;
            }

            const role = result[0].role === "super-admin" ? "super-admin" : "admin";

            const tokenRes = await axios.get("http://localhost:3006/token");

            localStorage.setItem("admin#token", JSON.stringify({ token: tokenRes.data, role }));
            navigation("/sidebar/dashboard");

        } catch (err) {
            console.log(err);
            Swal.fire({
                title: "Erreur",
                text: "Impossible de contacter le serveur. Merci de réessayer.",
                icon: "error",
                confirmButtonText: "OK",
                background: "#123779",
                customClass: {
                    confirmButton: "my-confirm-btn",
                    title: "swal-title",
                    htmlContainer: "swal-text"
                },
                buttonsStyling: false
            });
        } finally {
            setSubmitting(false);
        }
    }


    return (
        <div>
            <div className="login">
                <div className="forms">
                    <div className="logo">
                        <img src="/images/logo.png" alt="" />
                    </div>
                    <h4>Connexion</h4>
                    <form action="" onSubmit={submit}>
                        <div className="input">
                            <div>< FaUser className='i' /></div>
                            <input type="email" name="" id="" placeholder='ex@gmail.com' onChange={(e) => setEmail(e.target.value)} required disabled={submitting} />

                        </div>
                        <div className="input">
                            <div><GiUnlocking className='i' /></div>
                            <input type="password" name="" id="" placeholder='***' onChange={(e) => setPassword(e.target.value)} required disabled={submitting} />
                        </div>


                        <button type='submit' disabled={submitting}>
                            {submitting ? "Connexion en cours..." : "Se connecter"}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    )
}