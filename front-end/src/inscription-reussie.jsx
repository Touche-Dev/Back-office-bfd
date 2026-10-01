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
import { FaCreditCard, FaMobileAlt, FaHandHoldingUsd, FaIdBadge } from "react-icons/fa";

export default function InscriptionReussie() {
  const [inscription, setInscription] = useState([])
  const [overlay, setOverlay] = useState(false)
  const [overlayItem, setOverlayItem] = useState({})
  const context = useOutletContext();
  const [badge, setBadge] = useState([])


  const PAID_STATUSES = ["paid", "manuelle", "organisateur", "vip", "partenaire", "institutionnel"];

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

    // En-têtes des 4 dernières colonnes
    const ths = tableClone.querySelectorAll("thead tr th");
    const enTetes = ["Badge effectué", "Badge retiré", "Badge sur site", "Invitation dîner de gala"];
    enTetes.forEach((txt, i) => {
      const th = ths[ths.length - enTetes.length + i];
      if (th) th.textContent = txt;
    });

    // Lignes : checkbox -> Oui / Non pour les 4 dernières colonnes
    const originalRows = originalTable.querySelectorAll("tbody tr");
    tableClone.querySelectorAll("tbody tr").forEach((tr, i) => {
      const tds = tr.querySelectorAll("td");
      const origTds = originalRows[i].querySelectorAll("td");
      for (let j = tds.length - enTetes.length; j < tds.length; j++) {
        const checkbox = origTds[j]?.querySelector('input[type="checkbox"]');
        tds[j].textContent = checkbox?.checked ? "Oui" : "Non";
      }
    });

    tableClone.querySelectorAll("*").forEach(el => el.removeAttribute("class"));
    tableClone.removeAttribute("id");

    pdf.autoTable({
      html: tableClone,
      headStyles: {
        fillColor: [18, 55, 121],
        textColor: [255, 255, 255],
        fontStyle: "bold"
      },
      styles: { fontSize: 8 }
    });

    pdf.save("Inscriptions-Réussies.pdf");
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
      "Date",
      "Badge effectué",
      "Badge retiré",
      "Badge sur site",
      "Invitation dîner de gala"
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
        : "",
      isDone(item, "effectue") ? "Oui" : "Non",
      isDone(item, "retire") ? "Oui" : "Non",
      isDone(item, "suscite") ? "Oui" : "Non",
      isDone(item, "gala") ? "Oui" : "Non"
    ]);

    let csvContent = [headers.join(";")];
    rows.forEach(row => csvContent.push(row.map(d => `"${d}"`).join(";")));

    const csvString = csvContent.join("\n");
    const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Inscriptions-Réussies.csv";
    link.click();
  }

  useEffect(() => {
    axios.get("https://back-office-bfd.vercel.app/inscription")
      .then((res) => {
        //setInscription(res.data.filter((item) => item.status == "paid"))
        const paidStatuses = ["paid", "manuelle", "organisateur", "vip", "partenaire", "institutionnel"];

        if (JSON.parse(localStorage.getItem("admin#token")).role == "super-admin") {
          setInscription(res.data.filter((item) => paidStatuses.includes(item.status)));
        } else {
          setInscription(
            res.data
              .filter((item) => paidStatuses.includes(item.status))
              .filter((i) => i.payment_type === "physique")
          );
        }
      }).catch((err) => {
        console.log(err)
      })
  }, []);


  /*useEffect(() => {
    axios.get("https://back-office-bfd.vercel.app/inscription")
      .then((res) => {
        const paidStatuses = ["paid", "manuelle", "organisateur", "sponsor", "partenaire", "institutionnel", "media"];

        const trier = (liste) =>
          [...liste].sort((a, b) =>
            (a.nom_prenom || "").localeCompare(b.nom_prenom || "", "fr", { sensitivity: "base" })
          );

        if (JSON.parse(localStorage.getItem("admin#token")).role == "super-admin") {
          setInscription(trier(res.data.filter((item) => paidStatuses.includes(item.status))));
        } else {
          setInscription(
            trier(
              res.data
                .filter((item) => paidStatuses.includes(item.status))
                .filter((i) => i.payment_type === "physique")
            )
          );
        }
      }).catch((err) => {
        console.log(err)
      })
  }, []);*/


  useEffect(() => {
    axios.get("https://back-office-bfd.vercel.app/badge")
      .then((res) => {
        setBadge(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);


  const isDone = (item, champ) =>
    badge.some((b) => b.token === item.token && Number(b[champ]) === 1);

  const majLocal = (token, champ, valeur) => {
    setBadge((prev) => {
      const existe = prev.some((b) => b.token === token);
      return existe
        ? prev.map((b) => (b.token === token ? { ...b, [champ]: valeur } : b))
        : [...prev, { token, effectue: 0, retire: 0, suscite: 0, gala: 0, [champ]: valeur }];
    });
  };

  const swalBase = {
    background: "#123779",
    buttonsStyling: false,
  };

  const swalClasses = (avecAnnuler = false) => ({
    confirmButton: "my-confirm-btn",
    ...(avecAnnuler ? { cancelButton: "my-cancel-btn" } : {}),
    title: "swal-title",
    htmlContainer: "swal-text",
  });

  const toggleBadge = (item, champ, route, textes) => {
    const etaitCoche = isDone(item, champ);
    const nouvelleValeur = etaitCoche ? 0 : 1;
    const t = etaitCoche ? textes.annuler : textes.valider;

    Swal.fire({
      title: t.confirmTitle,
      text: t.confirmText(item),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Continuer",
      cancelButtonText: "Annuler",
      customClass: swalClasses(true),
      ...swalBase,
    }).then((result) => {
      if (!result.isConfirmed) return;

      majLocal(item.token, champ, nouvelleValeur);

      axios
        .post(`https://back-office-bfd.vercel.app/${route}`, {
          token: item.token,
          value: nouvelleValeur,
        })
        .then(() => {
          Swal.fire({
            title: t.successTitle,
            text: t.successText,
            icon: "success",
            confirmButtonText: "OK",
            customClass: swalClasses(),
            ...swalBase,
          });
        })
        .catch((err) => {
          console.log(err);
          majLocal(item.token, champ, etaitCoche ? 1 : 0); // rollback

          Swal.fire({
            title: "Erreur",
            text: t.errorText,
            icon: "error",
            confirmButtonText: "OK",
            customClass: swalClasses(),
            ...swalBase,
          });
        });
    });
  };

  // ---- Badge effectué ----
  const toggleEffectue = (item) =>
    toggleBadge(item, "effectue", "majbadge", {
      valider: {
        confirmTitle: "Confirmer le badge ?",
        confirmText: (i) => `Confirmez-vous que le badge de ${i.nom_prenom} est fait ?`,
        successTitle: "Badge enregistré !",
        successText: "Le badge de cet inscrit est marqué comme fait.",
        errorText: "Impossible d'enregistrer le badge.",
      },
      annuler: {
        confirmTitle: "Annuler le badge ?",
        confirmText: (i) => `Voulez-vous vraiment annuler le badge fait de ${i.nom_prenom} ?`,
        successTitle: "Badge annulé !",
        successText: "Le badge de cet inscrit n'est plus marqué comme fait.",
        errorText: "Impossible d'annuler le badge.",
      },
    });

  // ---- Badge retiré ----
  const toggleRetire = (item) =>
    toggleBadge(item, "retire", "majbadge-retire", {
      valider: {
        confirmTitle: "Confirmer le retrait ?",
        confirmText: (i) => `Confirmez-vous que ${i.nom_prenom} a retiré son badge ?`,
        successTitle: "Retrait enregistré !",
        successText: "Le badge de cet inscrit est marqué comme retiré.",
        errorText: "Impossible d'enregistrer le retrait.",
      },
      annuler: {
        confirmTitle: "Annuler le retrait ?",
        confirmText: (i) => `Voulez-vous vraiment annuler le retrait du badge de ${i.nom_prenom} ?`,
        successTitle: "Retrait annulé !",
        successText: "Le badge de cet inscrit n'est plus marqué comme retiré.",
        errorText: "Impossible d'annuler le retrait.",
      },
    });

  // ---- Badge sur site ----
  const toggleSuscite = (item) =>
    toggleBadge(item, "suscite", "majbadge-suscite", {
      valider: {
        confirmTitle: "Confirmer le badge sur site ?",
        confirmText: (i) => `Confirmez-vous le badge sur site pour ${i.nom_prenom} ?`,
        successTitle: "Badge sur site enregistré !",
        successText: "Le badge sur site de cet inscrit est enregistré.",
        errorText: "Impossible d'enregistrer le badge sur site.",
      },
      annuler: {
        confirmTitle: "Annuler le badge sur site ?",
        confirmText: (i) => `Voulez-vous vraiment annuler le badge sur site de ${i.nom_prenom} ?`,
        successTitle: "Badge sur site annulé !",
        successText: "Le badge sur site de cet inscrit n'est plus enregistré.",
        errorText: "Impossible d'annuler le badge sur site.",
      },
    });


  // ---- Invitation dîner de gala ----
  const toggleGala = (item) =>
    toggleBadge(item, "gala", "majbadge-gala", {
      valider: {
        confirmTitle: "Confirmer l'invitation ?",
        confirmText: (i) => `Confirmez-vous que l'invitation au dîner de gala a été remise à ${i.nom_prenom} ?`,
        successTitle: "Invitation enregistrée !",
        successText: "L'invitation au dîner de gala est marquée comme remise.",
        errorText: "Impossible d'enregistrer l'invitation.",
      },
      annuler: {
        confirmTitle: "Annuler l'invitation ?",
        confirmText: (i) => `Voulez-vous vraiment annuler l'invitation au dîner de gala de ${i.nom_prenom} ?`,
        successTitle: "Invitation annulée !",
        successText: "L'invitation au dîner de gala n'est plus marquée comme remise.",
        errorText: "Impossible d'annuler l'invitation.",
      },
    });


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
                      ["paid", "manuelle", "organisateur", "vip", "partenaire", "institutionnel"].includes(overlayItem.status)
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
              </div>
              <div className="btn-overlay">
                <button className='submit' onClick={() => setOverlay(null)}>Fermer</button>
              </div>
            </div>
          </div>
        )
      }
      <div className="header">
        <h4>Inscriptions finalisées</h4>

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
        <div className="table-scroll">
          <table id='table'>
            <thead>
              <tr>
                <th className='col1'>N°</th>
                <th className='col2'>Inscrits</th>
                <th className='col4'>Email</th>
                <th className='col6'>Organisation</th>
                <th className='col6'>Type participant</th>
                <th className='col6'>Badge effectué</th>
                <th className='col6'>Badge retiré</th>
                <th className='col6'>Badge sur site</th>
                <th className='col6'>Invitation dîner de gala</th>
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
                    <td className='email'>{item.email}</td>
                    <td className='institution'>{item.organisation}</td>
                    <td className='statustd'>
                      <span
                        className={
                          ["paid", "manuelle"].includes(item.status)
                            ? "participant"
                            : item.status == "organisateur"
                              ? "organisateur"
                              : item.status == "partenaire"
                                ? "partenaire"
                                : item.status == "institutionnel"
                                  ? "institutionnel"
                                  : item.status == "media"
                                    ? "media"
                                    : "vip"
                        }
                      >
                        {["paid", "manuelle"].includes(item.status) ? "participant" : item.status}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {PAID_STATUSES.includes(item.status) && (
                        <input
                          type="checkbox"
                          checked={isDone(item, "effectue")}
                          onChange={() => toggleEffectue(item)}
                          style={{ cursor: "pointer" }}
                        />
                      )}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {PAID_STATUSES.includes(item.status) && (
                        <input
                          type="checkbox"
                          checked={isDone(item, "retire")}
                          onChange={() => toggleRetire(item)}
                          style={{ cursor: "pointer" }}
                        />
                      )}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {PAID_STATUSES.includes(item.status) && (
                        <input
                          type="checkbox"
                          checked={isDone(item, "suscite")}
                          onChange={() => toggleSuscite(item)}
                          style={{ cursor: "pointer" }}
                        />
                      )}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {PAID_STATUSES.includes(item.status) && (
                        <input
                          type="checkbox"
                          checked={isDone(item, "gala")}
                          onChange={() => toggleGala(item)}
                          style={{ cursor: "pointer" }}
                        />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

