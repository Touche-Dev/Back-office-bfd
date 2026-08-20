import { useEffect } from 'react';
import axios from "axios"
import { useState } from 'react';
import { IoEye, IoEyeOff } from "react-icons/io5";
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';


export default function Password() {
  const navigation = useNavigate()


  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  async function submit(e) {
    e.preventDefault();

    if (submitting) return; // sécurité supplémentaire contre les doubles clics

    try {
      setSubmitting(true);

      const ress = await axios.get("http://localhost:3006/");

      const result = ress.data.filter(
        (user) =>
          user.role === JSON.parse(localStorage.getItem("admin#token")).role &&
          user.password === oldPassword
      );

      if (result.length === 0) {
        Swal.fire({
          title: "Erreur",
          text: "Mot de passe incorrect",
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

      if (newPassword !== confirmPassword) {
        Swal.fire({
          title: "Erreur",
          text: "Les deux codes ne correspondent pas.",
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

      // Confirmation avant de changer réellement le mot de passe
      const confirmation = await Swal.fire({
        title: "Changer le mot de passe ?",
        text: "Cette action modifiera définitivement votre mot de passe.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Oui, changer",
        cancelButtonText: "Annuler",
        background: "#123779",
        customClass: {
          confirmButton: "my-confirm-btn",
          cancelButton: "my-cancel-btn",
          title: "swal-title",
          htmlContainer: "swal-text"
        },
        buttonsStyling: false
      });

      // Si l'utilisateur clique sur Annuler → on arrête tout
      if (!confirmation.isConfirmed) {
        return;
      }

      const res = await axios.post("http://localhost:3006/newPassword", {
        mdp: newPassword,
        role: JSON.parse(localStorage.getItem("admin#token")).role
      });

      if (res.data === "Mise à jour réussie !") {
        await Swal.fire({
          title: "Succès",
          text: "Mot de passe changé avec succès.",
          icon: "success",
          confirmButtonText: "OK",
          background: "#123779",
          customClass: {
            confirmButton: "my-confirm-btn",
            title: "swal-title",
            htmlContainer: "swal-text"
          },
          buttonsStyling: false
        });
        localStorage.clear()
        navigation("/")
      } else {
        Swal.fire({
          title: "Erreur",
          text: "Veuillez réessayer plus tard.",
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
      }
    } catch (err) {
      console.log(err);
      Swal.fire({
        title: "Erreur",
        text: "Une erreur est survenue. Merci de réessayer.",
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
    <div className='dashboard password'>
      <div className="header">
        <h4>Modification de mot de passe</h4>
      </div>
      <form action="" onSubmit={submit}>
        <div className="content">
          <div className="content1">
            <div className="input">
              <div onClick={() => setShowOld(!showOld)} >{showOld ? <IoEyeOff className="i" /> : <IoEye className="i" />}</div>
              <input type={showOld ? 'text' : 'password'} name="" id="" placeholder="Entrer l’ancien mot de passe" onChange={(e) => setOldPassword(e.target.value)} required disabled={submitting} />
            </div>
          </div>
          <div className="content1">
            <div className="input">
              <div onClick={() => setShowNew(!showNew)} >{showNew ? <IoEyeOff className="i" /> : <IoEye className="i" />}</div>
              <input type={showNew ? 'text' : 'password'} name="" id="" placeholder="Entrer le nouveau mot de passe" onChange={(e) => setNewPassword(e.target.value)} required disabled={submitting} />
            </div>
            <div className="input">
              <div onClick={() => setShowConfirm(!showConfirm)} >{showConfirm ? <IoEyeOff className="i" /> : <IoEye className="i" />}</div>
              <input type={showConfirm ? 'text' : 'password'} name="" id="" placeholder='Confirmer le nouveau mot de passe' onChange={(e) => setConfirmPassword(e.target.value)} required disabled={submitting} />
            </div>
          </div>

          <button type='submit' disabled={submitting}>
            {submitting ? "Modification en cours..." : "Modifier"}
          </button>
        </div>
      </form>

    </div>
  )
}