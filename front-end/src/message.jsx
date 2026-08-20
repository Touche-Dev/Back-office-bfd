import { useEffect } from 'react';
import axios from "axios"
import { useState } from 'react';
import { FaIdBadge } from "react-icons/fa";
import { useOutletContext } from "react-router-dom";
import { MdOutlineMessage } from "react-icons/md";


export default function Message() {
  const [presse, setPresse] = useState([])
  const [overlay, setOverlay] = useState(false)
  const [overlayItem, setOverlayItem] = useState({})


  const context = useOutletContext();
  const { searchValue } = useOutletContext();
  useEffect(() => {
    if (context) {
      context.searchValue = null;
    }
  }, [context]);

  useEffect(() => {
    axios.get("http://localhost:3006/contact")
      .then((res) => {
        setPresse(res.data)
      }).catch((err) => {
        console.log(err)
      })
  }, []);



  function ExportPdf() {
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
        fillColor: [18, 55, 121],
        textColor: [255, 255, 255],
        fontStyle: "bold"
      },
      styles: {
        fontSize: 8
      }
    });

    pdf.save("Contact.pdf");
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

    const headers = ["ID", "Nom","Prenom", "Email", "Téléphone", "Sujet", "Méssage", "Date"];

    const rows = presse.map((item, key) => [
      key + 1,
      cleanData(item.nom),
      cleanData(item.prenom),
      cleanData(item.email),
      cleanData(item.tel, true),
      cleanData(item.sujet),
      cleanData(item.message),
      `${String(new Date(item.created_at).getDate()).padStart(2, "0")}/${String(new Date(item.created_at).getMonth() + 1).padStart(2, "0")}/${new Date(item.created_at).getFullYear()}`
    ]);

    let csvContent = [headers.join(";")];

    rows.forEach(row => {
      csvContent.push(row.map(d => `"${d}"`).join(";"));
    });

    const csvString = csvContent.join("\n");

    const blob = new Blob(["\uFEFF" + csvString], {
      type: "text/csv;charset=utf-8;"
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Accréditation-Presse.csv";
    link.click();
  }





  return (
    <div className='dashboard presse'>

      {
        overlay && (
          <div className="overlay" onClick={() => setOverlay(false)}>
            <div className="overlay-card" onClick={(e) => e.stopPropagation()}>

              <div className="user">
                <div className="icon-sexe">
                  <MdOutlineMessage className='i' />
                </div>
                <div className="user-name">
                  <h3> {overlayItem.nom+" "+overlayItem.prenom} </h3>
                  <div><span>{overlayItem.sujet}</span></div>
                </div>
              </div>
              <div className="hr"></div>
              <div className="user-info">
                <div><h4>Email :</h4><span>{overlayItem.email}</span></div>
                <div><h4>Téléphone :</h4><span>{overlayItem.tel}</span></div>
                <div className='flex-c'><h4>Message :</h4><span>{overlayItem.message}</span></div>
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
        <h4>Message</h4>
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
              <th className='col2'>Nom</th>
              <th className='col4'>Email</th>
              <th className='col3'>Téléphone</th>
              <th className='col6'>Sujet</th>
            </tr>
          </thead>
          <tbody>
            {presse.length > 0 ? (
              (
                !searchValue
                  ? presse
                  : presse.filter(item =>
                    [
                      "nom",
                      "prenom",
                      "email",
                      "tel",
                      "sujet"
                    ].some(key =>
                      item[key]?.toString().toLowerCase().includes(searchValue.toLowerCase())
                    )
                  )
              ).map((item, key) => {
                return (
                  <tr key={key} onClick={() => { setOverlay(true); setOverlayItem(presse.filter((i) => i.id === item.id)[0]) }}>
                    <td>{item.id}</td>
                    <td className='nom'><span>{item.nom+" "+item.prenom}</span></td>
                    <td className='pays'>{item.email}</td>
                    <td className='tel'>{item.tel}</td>
                    <td className='fonction'>{item.sujet}</td>
                  </tr>
                )
              })
            ) : (
              <tr className="empty">
                <td colSpan="6">Aucun message n'a été recu</td>
              </tr>

            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}

