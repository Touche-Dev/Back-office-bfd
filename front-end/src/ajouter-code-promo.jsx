import { FaTicketAlt, FaPercent } from "react-icons/fa";
import axios from "axios"
import { useState } from 'react';
import Swal from "sweetalert2";
import { FaTag } from "react-icons/fa"
import { useNavigate } from 'react-router-dom';


export default function AjoutCodePromo() {
    const [code, setCode] = useState("")
    const [label, setLabel] = useState("")
    const [value, setValue] = useState("")
    const navigation = useNavigate()



    function submit(e) {
        e.preventDefault()


        axios.post("https://africapoliticaloutlook.vercel.app/insert-promo", { code: code, label: label, value: value })
            .then((res) => {
                if (res.data === "existant") {
                    Swal.fire({
                        title: "Error",
                        text: "Code promo existant",
                        icon: "error",
                        confirmButtonText: "OK",
                        customClass: {
                            confirmButton: "my-confirm-btn",
                            title: "swal-title",
                            htmlContainer: "swal-text"
                        },
                        buttonsStyling: false
                    })
                } else if (res.data === "ajoute") {
                    Swal.fire({
                        title: "Succès",
                        text: "Code promo ajouté avec succès.",
                        icon: "success",
                        confirmButtonText: "OK",
                        customClass: {
                            confirmButton: "my-confirm-btn",
                            title: "swal-title",
                            htmlContainer: "swal-text"
                        },
                        buttonsStyling: false
                    }).then(() => {
                       navigation("/sidebar/code-promo");
                    });
                }
                else {
                    Swal.fire({
                        title: "Erreur",
                        text: "Veuillez réessayer plus tard.",
                        icon: "error",
                        confirmButtonText: "OK",
                        customClass: {
                            confirmButton: "my-confirm-btn",
                            title: "swal-title",
                            htmlContainer: "swal-text"
                        },
                        buttonsStyling: false
                    });
                }
            }).catch((err) => {
                console.log(err)
            })
    }



    return (
        <div className='dashboard promo'>
            <div className="header">
                <h4>Ajouter un code promo</h4>
            </div>
            <form action="" onSubmit={submit}>
                <div className="content">
                    <div className="content1">
                        <div className="input">
                            <div><FaTicketAlt className='i' /></div>
                            <input type="text" name="" id="" placeholder='code promo' value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} required />
                        </div>
                    </div>
                    <div className="content1">
                        <div className="input">
                            <div><FaTag className='i' /></div>
                            <input type="text" name="" id="" placeholder='label' onChange={(e) => setLabel(e.target.value)} required />
                        </div>
                    </div>
                    <div className="content1">
                        <div className="input">
                            <div><FaPercent className='i' /></div>
                            <input type="number" name="" id="" placeholder='valeur' onChange={(e) => setValue(e.target.value)} required />
                        </div>
                    </div>

                    <button type='submit'>Ajouter</button>
                </div>
            </form>


        </div>
    )
}

