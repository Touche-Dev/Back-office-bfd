import { useEffect } from 'react';
import axios from "axios"
import { useState } from 'react';
import { SlUserFemale } from "react-icons/sl";
import { SlUser } from "react-icons/sl";
import { FaUserCheck } from "react-icons/fa";
import { FaUserClock } from "react-icons/fa";
import { useOutletContext } from "react-router-dom";
import { FaCheck } from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import { FaCreditCard, FaMobileAlt, FaHandHoldingUsd } from "react-icons/fa";

export default function InscriptionNonFinalisee() {
  const [inscription, setInscription] = useState([])
  const [relance, setRelance] = useState([])
  const [overlay, setOverlay] = useState(false)
  const [overlayItem, setOverlayItem] = useState({})
  const context = useOutletContext();

  const { searchValue } = useOutletContext();
  useEffect(() => {
    if (context) {
      context.searchValue = null;
    }
  }, [context]);









  function ExportPdf() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("l", "mm", "a4");

    const originalTable = document.getElementById("table");
    const tableClone = originalTable.cloneNode(true);

    tableClone.querySelectorAll("*").forEach(el => el.removeAttribute("class"));
    tableClone.removeAttribute("id");

    pdf.autoTable({
      html: tableClone,
      headStyles: {
        fillColor: [18, 55, 121],
        textColor: [255, 255, 255],
        fontStyle: "bold"
      },
      styles: {
        fontSize: 8
      }
    });

    pdf.save("Inscriptions-Incomplètes.pdf");
  }

  function ExportCsv() {
    const cleanData = (data, isPhone = false) => {
      if (!data && data !== 0) return "";
      let value = data.toString()
        .replace(/(\r\n|\n|\r)/g, " ")
        .replace(/;/g, ",")
        .trim();

      if (isPhone) return `'${value}`;
      return value;
    };

    const headers = [
      "ID",
      "Token",
      "Nom & Prénom",
      "Date de naissance",
      "Nationalité",
      "Code Postal",
      "Ville",
      "Téléphone",
      "Email",
      "Organisation",
      "Fonction",
      "Secteur d'activité",
      "Site web",
      "Sujets d'intérêt",
      "B2B",
      "Besoin spécifique",
      "Type de paiement",
      "Pass",
      "Jours",
      "Prix",
      "Devise",
      "Mollie Payment ID",
      "Payment ID",
      "Preuve de paiement",
      "Status",
      "Email envoyé",
      "Date"
    ];

    const rows = inscription.map((item, key) => [
      key + 1,
      cleanData(item.token),
      cleanData(item.nom_prenom),
      cleanData(item.date_naissance),
      cleanData(item.nationalite),
      cleanData(item.code_postal),
      cleanData(item.ville),
      cleanData(item.tel, true),
      cleanData(item.email),
      cleanData(item.organisation),
      cleanData(item.fonction),
      cleanData(item.secteur_activite),
      cleanData(item.site_web),
      cleanData(item.sujets_interet),
      cleanData(item.b2b),
      cleanData(item.besoin_specifique),
      cleanData(item.payment_type),
      cleanData(item.pass),
      cleanData(item.days),
      cleanData(item.prix),
      cleanData(item.devise),
      cleanData(item.mollie_payment_id),
      cleanData(item.payment_id),
      cleanData(item.payment_proof_path),
      cleanData(item.status),
      cleanData(item.email_sent),
      item.created_at
        ? `${String(new Date(item.created_at).getDate()).padStart(2, "0")}/${String(new Date(item.created_at).getMonth() + 1).padStart(2, "0")}/${new Date(item.created_at).getFullYear()}`
        : ""
    ]);

    let csvContent = [headers.join(";")];
    rows.forEach(row => csvContent.push(row.map(d => `"${d}"`).join(";")));

    const csvString = csvContent.join("\n");
    const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Inscriptions-Incomplètes.csv";
    link.click();
  }

  useEffect(() => {
    axios.get("https://back-office-bfd.vercel.app/inscription")
      .then((res) => {
        const statusList = ["pending", "expired", "canceled"];

        // Regrouper tous les statuts par email
        const emailStatuses = {};

        res.data.forEach(item => {
          if (!emailStatuses[item.email]) {
            emailStatuses[item.email] = [];
          }
          emailStatuses[item.email].push(item);
        });

        const result = Object.values(emailStatuses)
          .filter(items => !items.some(i => i.status === "paid"))
          .map(items => items[0]); // garder un seul


        if (JSON.parse(localStorage.getItem("admin#token")).role == "super-admin") {
          setInscription(result)
        } else {
          setInscription(
            result.filter((i) => i.payment_type === "physique")
          );
        }
      }).catch((err) => {
        console.log(err)
      })
  }, []);


  useEffect(() => {
    axios.get("https://back-office-bfd.vercel.app/relance")
      .then((res) => {
        setRelance(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);




  return (
    <div className='dashboard inscription'>

      {
        overlay && (
          <div className="overlay" onClick={() => setOverlay(false)}>
            <div className="overlay-card" onClick={(e) => e.stopPropagation()}>

              <div className="user">
                <div className="icon-sexe">
                  {
                    overlayItem.payment_type === "mollie" ? (
                      <FaCreditCard className="i" />
                    ) : overlayItem.payment_type === "mobile_money" ? (
                      <FaMobileAlt className="i" />
                    ) : overlayItem.payment_type === "physique" ? (
                      <FaHandHoldingUsd className="i" />
                    ) : (
                      <FaUserClock className="i" />
                    )
                  }
                </div>
                <div className="user-name">
                  <h3> {overlayItem.nom_prenom} </h3>
                  <div><span>{overlayItem.fonction + ", " + overlayItem.organisation}</span></div>
                  <div><span>{overlayItem.secteur}</span></div>
                </div>
              </div>
              <div className="hr"></div>
              <div className="user-info">
                <div><h4>Nationalité :</h4><span>{overlayItem.nationalite}</span></div>
                <div>
                  <h4>Age :</h4>
                  <span>
                    {(() => {
                      const [jour, mois, annee] = overlayItem.date_naissance.split('/').map(Number);
                      const naissance = new Date(annee, mois - 1, jour);
                      const aujourdHui = new Date();

                      let age = aujourdHui.getFullYear() - naissance.getFullYear();

                      if (
                        aujourdHui.getMonth() < naissance.getMonth() ||
                        (aujourdHui.getMonth() === naissance.getMonth() &&
                          aujourdHui.getDate() < naissance.getDate())
                      ) {
                        age--;
                      }

                      return age;
                    })()} ans
                  </span>
                </div>
                <div><h4>Email :</h4><span>{overlayItem.email}</span></div>
                <div><h4>Téléphone :</h4><span>{overlayItem.tel}</span></div>
                <div><h4>Ville :</h4><span>{overlayItem.ville}</span></div>
                <div><h4>Code postal :</h4><span>{overlayItem.code_postal}</span></div>
                <div><h4>Secteur d'activité :</h4><span>{overlayItem.secteur_activite}</span></div>
                <div>
                  <h4>Site web :</h4>

                  <span>
                    {overlayItem.site_web == ""
                      ? "-"
                      : (
                        <a
                          href={
                            overlayItem.site_web.startsWith("http://") ||
                              overlayItem.site_web.startsWith("https://")
                              ? overlayItem.site_web
                              : `https://${overlayItem.site_web}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {overlayItem.site_web}
                        </a>
                      )
                    }
                  </span>
                </div>
                <div className='subjects'><h4>Sujets d'interet :</h4><span>{overlayItem.sujets_interet}</span></div>
                <div><h4>B2B :</h4><span>{overlayItem.b2b}</span></div>
                <div><h4>Besoin spécifique :</h4><span>{overlayItem.besoin_specifique == "" ? overlayItem.besoin_specifique : "-"}</span></div>
                <div className='status'>
                  <h4>Status :</h4>
                  <span
                    className={
                      ["paid", "manuelle", "organisateur", "sponsor", "Partenaire"].includes(overlayItem.status)
                        ? "paid"
                        : overlayItem.status == "expired"
                          ? "expired"
                          : overlayItem.status == "pending"
                            ? "pending"
                            : "expired"
                    }
                  >
                    {overlayItem.status}
                  </span>
                </div>
                <div><h4>Type de paiement:</h4><span>{overlayItem.payment_type != null ? overlayItem.payment_type : "-"}</span></div>
                {overlayItem.payment_id != null ? <div><h4>ID de paiement:</h4><span>{overlayItem.payment_id}</span></div> : ""}
                {overlayItem.payment_proof_path != null ? <div className='capture'><h4>Capture d'ecran:</h4><img src={`https://banguifinancialdays.org/${overlayItem.payment_proof_path}`} alt="" onClick={(e) => window.open(e.currentTarget.src, "_blank")} /></div> : ""}
                <div><h4>Date :</h4><span>
                  {new Date(overlayItem.created_at).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span></div>
                <div><h4>Nombre d'Email de relance :</h4><span>{relance.find((r) => r.email === overlayItem.email)?.nbr ?? 0}</span></div>
                <div><h4>Dernière relance :</h4><span>
                  {(() => {
                    const item = relance.find((r) => r.email === overlayItem.email);
                    if (!item?.created_at) return "Aucune";

                    const date = new Date(item.created_at);
                    date.setHours(date.getHours() + 1);

                    return date.toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    });
                  })()}
                </span></div>
              </div>
              <div className="btn-overlay">
                {(overlayItem.payment_proof_path != null &&
                  overlayItem.payment_id != null &&
                  overlayItem.status != "paid" &&
                  overlayItem.status != "rejected" &&
                  !inscription.some((i) => i.email === overlayItem.email && i.status === "paid")) ? (
                  <div className='validation'><div className="validation-buttons">
                    <button
                      type="button"
                      className="btn-validation"
                      disabled={overlayItem.status == "paid" ? true : false}
                      onClick={() => {
                        Swal.fire({
                          title: "Valider le paiement ?",
                          text: "Cette action validera définitivement l'inscription.",
                          icon: "question",
                          showCancelButton: true,
                          confirmButtonText: "Oui, valider",
                          cancelButtonText: "Annuler",
                          background: "#123779",
                          customClass: {
                            confirmButton: "my-confirm-btn",
                            cancelButton: "my-cancel-btn",
                            title: "swal-title",
                            htmlContainer: "swal-text"
                          },
                          buttonsStyling: false
                        }).then((result) => {

                          // Si l'utilisateur clique sur Annuler → on arrête tout
                          if (!result.isConfirmed) {
                            return;
                          }

                          // Étape 1 : valider le paiement
                          axios.post("https://back-office-bfd.vercel.app/validation-inscrit", {
                            token: overlayItem.token
                          })
                            .then((res) => {

                              if (res.data !== "Mise à jour réussie !") {
                                Swal.fire({
                                  title: "Erreur",
                                  text: "Une erreur est survenue lors de la validation.",
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

                              // Étape 2 : générer et envoyer la carte d'invitation
                              return fetch(
                                `https://banguifinancialdays.org/generate-invitation-card?token=${encodeURIComponent(overlayItem.token)}`
                              )
                                .then(async (response) => {
                                  const message = await response.text();

                                  if (!response.ok) {
                                    throw new Error(message);
                                  }

                                  return message;
                                })
                                .then((message) => {
                                  Swal.fire({
                                    title: "Paiement validé",
                                    text: message,
                                    icon: "success",
                                    confirmButtonText: "OK",
                                    background: "#123779",
                                    customClass: {
                                      confirmButton: "my-confirm-btn",
                                      title: "swal-title",
                                      htmlContainer: "swal-text"
                                    },
                                    buttonsStyling: false
                                  }).then(() => {
                                    window.location.reload();
                                  });
                                })
                                .catch((error) => {
                                  Swal.fire({
                                    title: "Paiement validé, mais...",
                                    text: error.message || "Le paiement a été validé, mais l'envoi de la carte d'invitation a échoué. Vous pouvez réessayer depuis la liste.",
                                    icon: "warning",
                                    confirmButtonText: "OK",
                                    background: "#123779",
                                    customClass: {
                                      confirmButton: "my-confirm-btn",
                                      title: "swal-title",
                                      htmlContainer: "swal-text"
                                    },
                                    buttonsStyling: false
                                  }).then(() => {
                                    window.location.reload();
                                  });
                                });

                            })
                            .catch((err) => {

                              console.log(err);

                              Swal.fire({
                                title: "Erreur",
                                text: "Une erreur est survenue lors de la validation.",
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

                            });
                        });
                      }}
                    ><FaCheck className="i" />
                      Valider le paiement
                    </button>
                    <button
                      type="button"
                      className="btn-rejeter"
                      onClick={() => {
                        Swal.fire({
                          title: "Rejeter l'inscription ?",
                          input: "select",
                          inputOptions: {
                            capture_illisible: "Capture d'écran illisible",
                            montant_incorrect: "Montant incorrect",
                            id_invalide: "ID de transaction invalide",
                            preuve_non_conforme: "Preuve non conforme",
                            autre: "Autre raison"
                          },
                          inputPlaceholder: "Sélectionnez un motif",
                          showCancelButton: true,
                          confirmButtonText: "Continuer",
                          cancelButtonText: "Annuler",
                          background: "#123779",
                          customClass: {
                            confirmButton: "my-confirm-btn",
                            cancelButton: "my-cancel-btn",
                            title: "swal-title",
                            htmlContainer: "swal-text",
                            input: "swal-select"
                          },
                          buttonsStyling: false,
                          inputValidator: (value) => {
                            if (!value) return "Vous devez sélectionner un motif";
                          }
                        }).then((selectResult) => {
                          if (!selectResult.isConfirmed) return;

                          const motifChoisi = selectResult.value;

                          const finaliserRejet = (motifFinal) => {
                            Swal.fire({
                              title: "Confirmer le rejet ?",
                              text: "Cette action rejettera l'inscription et une notification sera envoyée à l'inscrit.",
                              icon: "warning",
                              showCancelButton: true,
                              confirmButtonText: "Oui, rejeter",
                              cancelButtonText: "Annuler",
                              background: "#123779",
                              customClass: {
                                confirmButton: "my-confirm-btn",
                                cancelButton: "my-cancel-btn",
                                title: "swal-title",
                                htmlContainer: "swal-text"
                              },
                              buttonsStyling: false
                            }).then((confirmResult) => {
                              if (!confirmResult.isConfirmed) return;

                              fetch(
                                `https://banguifinancialdays.org/rejected?token=${encodeURIComponent(overlayItem.token)}&motif=${encodeURIComponent(motifFinal)}`
                              )
                                .then(async (response) => {
                                  const message = await response.text();
                                  if (!response.ok) throw new Error(message);
                                  return message;
                                })
                                .then((message) => {
                                  Swal.fire({
                                    title: "Inscription rejetée",
                                    text: message,
                                    icon: "success",
                                    confirmButtonText: "OK",
                                    background: "#123779",
                                    customClass: {
                                      confirmButton: "my-confirm-btn",
                                      title: "swal-title",
                                      htmlContainer: "swal-text"
                                    },
                                    buttonsStyling: false
                                  }).then(() => {
                                    window.location.reload();
                                  });
                                })
                                .catch((error) => {
                                  Swal.fire({
                                    title: "Erreur",
                                    text: error.message || "Une erreur est survenue lors du rejet.",
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
                                });
                            });
                          };

                          // Si "Autre raison" est choisi, on demande de préciser
                          if (motifChoisi === "autre") {
                            Swal.fire({
                              title: "Précisez le motif",
                              input: "textarea",
                              inputPlaceholder: "Décrivez la raison du rejet...",
                              showCancelButton: true,
                              confirmButtonText: "Continuer",
                              cancelButtonText: "Annuler",
                              background: "#123779",
                              customClass: {
                                confirmButton: "my-confirm-btn",
                                cancelButton: "my-cancel-btn",
                                title: "swal-title",
                                htmlContainer: "swal-text",
                                input: "swal-textarea"
                              },
                              buttonsStyling: false,
                              inputValidator: (value) => {
                                if (!value) return "Merci de préciser le motif";
                              }
                            }).then((textResult) => {
                              if (!textResult.isConfirmed) return;
                              finaliserRejet(textResult.value);
                            });
                          } else {
                            finaliserRejet(motifChoisi);
                          }
                        });
                      }}
                    ><FaTimes className="i" />
                      Rejeter l'inscription
                    </button>
                  </div>
                  </div>
                ) : ""}
                {!inscription.some(
                  (item) => item.email === overlayItem.email && item.status === "paid"
                ) && overlayItem.payment_type !== "mobile_money" ? (
                  <div className='validation'>
                    <div className="validation-buttons">
                      <button
                        type="button"
                        className="btn-relance"
                        onClick={() => {
                          Swal.fire({
                            title: "Relancer l'inscription ?",
                            text: "Un e-mail de rappel sera envoyé à l'inscrit pour finaliser son paiement.",
                            icon: "question",
                            showCancelButton: true,
                            confirmButtonText: "Oui, relancer",
                            cancelButtonText: "Annuler",
                            background: "#123779",
                            customClass: {
                              confirmButton: "my-confirm-btn",
                              cancelButton: "my-cancel-btn",
                              title: "swal-title",
                              htmlContainer: "swal-text"
                            },
                            buttonsStyling: false
                          }).then((result) => {

                            // Si l'utilisateur clique sur Annuler → on arrête tout
                            if (!result.isConfirmed) {
                              return;
                            }

                            fetch(
                              `https://banguifinancialdays.org/relancer-inscrit?email=${encodeURIComponent(overlayItem.email)}`
                            )
                              .then(async (response) => {
                                const message = await response.text();

                                if (!response.ok) {
                                  throw new Error(message);
                                }

                                return message;
                              })
                              .then((message) => {
                                Swal.fire({
                                  title: "Relance envoyée !",
                                  text: message,
                                  icon: "success",
                                  confirmButtonText: "OK",
                                  background: "#123779",
                                  customClass: {
                                    confirmButton: "my-confirm-btn",
                                    title: "swal-title",
                                    htmlContainer: "swal-text"
                                  },
                                  buttonsStyling: false
                                })
                              })
                              .catch((error) => {
                                Swal.fire({
                                  icon: "error",
                                  title: "Erreur",
                                  text: error.message || "Impossible d'envoyer la relance."
                                });
                              });

                          });
                        }}
                      >
                        Relancer l'inscription
                      </button>
                    </div>
                  </div>
                ) : ""}
                <button className='submit' onClick={() => setOverlay(null)}>Fermer</button>
              </div>
            </div>
          </div>
        )
      }
      <div className="header">
        <h4>Inscriptions incomplètes</h4>

        <div className="select-wrapper">
          <select
            className="custom-select"
            onChange={(e) => {
              if (e.target.value === "pdf") ExportPdf();
              if (e.target.value === "csv") ExportCsv();
            }}>
            <option value="">Exporter</option>
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
          </select>
        </div>


      </div>
      <div className="content">
        <table id='table'>
          <thead>
            <tr>
              <th className='col1'>N°</th>
              <th className='col2'>Inscrits</th>
              <th className='col3'>Nationalité</th>
              <th className='col4'>Email</th>
              <th className='col6'>Organisation</th>
              <th className='col7'>status</th>
            </tr>
          </thead>
          <tbody>
            {(
              !searchValue
                ? inscription
                : inscription.filter(item =>
                  [
                    "nom_prenom",
                    "email",
                    "tel",
                    "nationalite",
                    "ville",
                    "organisation",
                    "fonction",
                    "secteur_activite",
                    "payment_type",
                    "status"
                  ].some(key =>
                    item[key]?.toString().toLowerCase().includes(searchValue.toLowerCase())
                  )
                )
            ).map((item, key) => {
              return (
                <tr key={key} onClick={() => { setOverlay(true); setOverlayItem(inscription.filter((i) => i.id === item.id)[0]) }}>
                  <td>{item.id}</td>
                  <td className='nom'> <div className="icon">{
                    item.payment_type === "mollie" ? (
                      <FaCreditCard className="i" />
                    ) : item.payment_type === "mobile_money" ? (
                      <FaMobileAlt className="i" />
                    ) : item.payment_type === "physique" ? (
                      <FaHandHoldingUsd className="i" />
                    ) : (
                      <FaUserClock className="i" />
                    )
                  }</div><span>{item.nom_prenom}</span></td>
                  <td className='pays'>{item.nationalite}</td>
                  <td className='email'>{item.email}</td>
                  <td className='institution'>{item.organisation}</td>
                  <td className='statustd'>
                    <span
                      className={
                        ["paid", "manuelle", "organisateur", "sponsor", "partenaire"].includes(item.status)
                          ? "paid"
                          : item.status == "expired"
                            ? "expired"
                            : item.status == "pending"
                              ? "pending"
                              : "expired"
                      }
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

    </div>
  )
}

