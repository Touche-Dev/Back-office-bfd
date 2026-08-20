import { useEffect } from 'react';
import axios from "axios"
import { useState } from 'react';
import { SlUserFemale } from "react-icons/sl";
import { SlUser } from "react-icons/sl";
import { useOutletContext } from "react-router-dom";


export default function InscriptionPromo() {
  const [inscription, setInscription] = useState([])
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
    if (window.jspdf && window.jspdf.jsPDF) {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF("l", "mm", "a4");

      const originalTable = document.getElementById("table");

      if (!originalTable) return;

      const tableClone = originalTable.cloneNode(true);

      tableClone.querySelectorAll("*").forEach(el => el.removeAttribute("class"));
      tableClone.removeAttribute("id");

      pdf.autoTable({
        html: tableClone,
        headStyles: {
          fillColor: [206, 60, 19],
          textColor: [255, 255, 255],
          fontStyle: "bold"
        },
        styles: { fontSize: 8 }
      });

      pdf.save("Inscriptions-Promos.pdf");
    }
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
      "ID", "Token", "Nom", "Prénoms", "Sexe", "Nationalité", "Pays", "Ville",
      "Email", "Téléphone", "Code Postal", "Adresse", "Secteur", "Institution",
      "Fonction", "Adresse Pro", "Déjà participé", "Source", "Besoins", "Promo",
      "Code Promo", "Valeur Promo", "Accept Terms", "Status", "Payment ID",
      "Montant", "Devise", "Pass", "Jours", "Email envoyé", "Date"
    ];

    const rows = inscription.map((item, key) => [
      key + 1,
      cleanData(item.token),
      cleanData(item.nom),
      cleanData(item.prenoms),
      cleanData(item.sexe),
      cleanData(item.nationalite),
      cleanData(item.pays),
      cleanData(item.ville),
      cleanData(item.email),
      cleanData(item.tel, true),
      cleanData(item.code_postal),
      cleanData(item.adresse),
      cleanData(item.secteur),
      cleanData(item.institution),
      cleanData(item.fonction),
      cleanData(item.adresse_pro),
      cleanData(item.deja_participe),
      cleanData(item.source),
      cleanData(item.besoins),
      cleanData(item.promo),
      cleanData(item.promo_code),
      cleanData(item.promo_value),
      cleanData(item.accept_terms),
      cleanData(item.status),
      cleanData(item.mollie_payment_id),
      cleanData(item.amount_value),
      cleanData(item.currency),
      cleanData(item.passlabel),
      cleanData(item.days),
      cleanData(item.email_sent),
      `${String(new Date(item.created_at).getDate()).padStart(2, "0")}/${String(new Date(item.created_at).getMonth() + 1).padStart(2, "0")}/${new Date(item.created_at).getFullYear()}`
    ]);

    let csvContent = [headers.join(";")];
    rows.forEach(row => csvContent.push(row.map(d => `"${d}"`).join(";")));

    const blob = new Blob(["\uFEFF" + csvContent.join("\n")], {
      type: "text/csv;charset=utf-8;"
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Inscriptions-Promos.csv";
    link.click();
  }

  
  useEffect(() => {
    axios.get("https://africapoliticaloutlook.vercel.app/inscription")
      .then((res) => {
        setInscription(res.data.filter((item) => item.promo == "1" && item.status === "paid"))
      }).catch((err) => {
        console.log(err)
      })
  }, []);



  return (
    <div className='dashboard inscription'>

      {
        overlay && (
          <div className="overlay" onClick={() => setOverlay(false)}>
            <div className="overlay-card" onClick={(e) => e.stopPropagation()}>

              <div className="user">
                <div className="icon-sexe">
                  {overlayItem.sexe === "Homme" ? <SlUser className='i' /> : <SlUserFemale className='i' />}
                </div>
                <div className="user-name">
                  <h3> {overlayItem.nom + " " + overlayItem.prenoms} </h3>
                  <div><span>{overlayItem.fonction + ", " + overlayItem.institution}</span></div>
                  <div><span>{overlayItem.secteur}</span></div>
                </div>
              </div>
              <div className="hr"></div>
              <div className="user-info">
                <div><h4>Nationalité :</h4><span>{overlayItem.nationalite}</span></div>
                <div><h4>Pays :</h4><span>{overlayItem.pays}</span></div>
                <div><h4>Ville :</h4><span>{overlayItem.ville}</span></div>
                <div><h4>Email :</h4><span>{overlayItem.email}</span></div>
                <div><h4>Téléphone :</h4><span>{overlayItem.tel}</span></div>
                <div><h4>Code postal :</h4><span>{overlayItem.code_postal}</span></div>
                <div><h4>Adresse :</h4><span>{overlayItem.adresse}</span></div>
                <div><h4>Adresse pro :</h4><span>{overlayItem.adresse_pro}</span></div>
                <div><h4>Déjà participé :</h4><span>{overlayItem.deja_participe}</span></div>
                <div><h4>Source :</h4><span>{overlayItem.source}</span></div>
                <div><h4>Besoin :</h4><span>{overlayItem.besoin != null ? overlayItem.besoin : "-"}</span></div>
                <div><h4>Promo :</h4><span>{overlayItem.promo != 0 ? overlayItem.besoin : "-"}</span></div>
                <div><h4>Code promo :</h4><span>{overlayItem.code_promo != null ? overlayItem.code_promo : "-"}</span></div>
                <div><h4>Réduction :</h4><span>{overlayItem.promo_value != 0 ? overlayItem.promo_value + "%" : "-"}</span></div>
                <div className='status'><h4>Status :</h4><span className={overlayItem.status == "paid" ? "paid" : overlayItem.status == "expired" ? "expired" : overlayItem.status == "pending" ? "pending" : ""}>{overlayItem.status}</span></div>
                <div><h4>Montant :</h4><span>{overlayItem.amount_value + " " + overlayItem.currency}</span></div>
                <div><h4>Pass :</h4><span>{overlayItem.passlabel}</span></div>
                <div><h4>Days :</h4><span>{overlayItem.days}</span></div>
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

              <button className='submit' onClick={() => setOverlay(null)}>Fermer</button>

            </div>
          </div>
        )
      }
      <div className="header">
        <h4>Inscriptions via code promo</h4>
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
              <th className='col3'>Pays</th>
              <th className='col4'>Email</th>
              <th className='col6'>Intitution</th>
              <th className='col7'>status</th>
            </tr>
          </thead>
          <tbody>
            {inscription.length > 0 ? (
              (
                !searchValue
                  ? inscription
                  : inscription.filter(item =>
                    [
                      "nom",
                      "prenoms",
                      "email",
                      "tel",
                      "pays",
                      "ville",
                      "institution",
                      "fonction",
                      "promo_code",
                      "status"
                    ].some(key =>
                      item[key]?.toString().toLowerCase().includes(searchValue.toLowerCase())
                    )
                  )
              ).map((item, key) => {
                return (
                  <tr key={key} onClick={() => { setOverlay(true); setOverlayItem(inscription.filter((i) => i.id === item.id)[0]) }}>
                    <td>{key + 1}</td>
                    <td className='nom'> <div className="icon">{item.sexe === "Homme" ? <SlUser className='i' /> : <SlUserFemale className='i' />}</div><span>{item.nom + " " + item.prenoms}</span></td>
                    <td className='pays'>{item.pays}</td>
                    <td className='email'>{item.email}</td>
                    <td className='institution'>{item.institution}</td>
                    <td className='statustd'><span className={item.status == "paid" ? "paid" : item.status == "expired" ? "expired" : item.status == "pending" ? "pending" : ""}>{item.status}</span></td>
                  </tr>
                )
              })
            ) : (
              <tr className="empty">
                <td colSpan="6"> Aucune inscription via code promo n'a été faite</td>
              </tr>

            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}

