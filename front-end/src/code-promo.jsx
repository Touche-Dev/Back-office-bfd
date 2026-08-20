import { useEffect } from 'react';
import axios from "axios"
import { useState } from 'react';
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';
import { useOutletContext } from "react-router-dom";


export default function CodePromo() {
  const [codes, setCodes] = useState([])
  const navigation = useNavigate()


  const context = useOutletContext();
  const { searchValue } = useOutletContext();
  useEffect(() => {
    if (context) {
      context.searchValue = null;
    }
  }, [context]);

  useEffect(() => {
    axios.get("https://africapoliticaloutlook.vercel.app/promo")
      .then((res) => {
        setCodes(res.data)
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
        fillColor: [206, 60, 19],
        textColor: [255, 255, 255],
        fontStyle: "bold"
      },
      styles: {
        fontSize: 10
      }
    });

    pdf.save("Codes-Promos.pdf");
  }
  function ExportCsv() {
    const headers = ["ID", "Code", "Label", "Valeur", "Active", "Date"];

    const rows = codes.map((item, key) => [
      key + 1,
      item.code,
      item.label,
      item.value,
      item.is_active,
      `${String(new Date(item.created_at).getDate()).padStart(2, "0")}/${String(new Date(item.created_at).getMonth() + 1).padStart(2, "0")}/${new Date(item.created_at).getFullYear()}`
    ]);

    let csvContent = [headers.join(";")];

    rows.forEach(row => {
      csvContent.push(row.map(d => `"${d}"`).join(";"));
    });

    const blob = new Blob(["\uFEFF" + csvContent.join("\n")], {
      type: "text/csv;charset=utf-8;"
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Codes-Promos.csv";
    link.click();
  }


  function activer(code) {
    axios.post("https://africapoliticaloutlook.vercel.app/activ-promo", { id: code })
      .then((res) => {
        if (res.data === "Mise à jour réussie !") {
          Swal.fire({
            title: "Succès",
            text: "Code promo activé",
            icon: "success",
            confirmButtonText: "OK",
            customClass: {
              confirmButton: "my-confirm-btn",
              title: "swal-title",
              htmlContainer: "swal-text"
            },
            buttonsStyling: false
          }).then(() => {
            window.location.reload();
          });;
        } else {
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


  function desactiver(code) {
    axios.post("https://africapoliticaloutlook.vercel.app/desac-promo", { id: code })
      .then((res) => {
        if (res.data === "Mise à jour réussie !") {
          Swal.fire({
            title: "Succès",
            text: "Code promo désactivé",
            icon: "success",
            confirmButtonText: "OK",
            customClass: {
              confirmButton: "my-confirm-btn",
              title: "swal-title",
              htmlContainer: "swal-text"
            },
            buttonsStyling: false
          }).then(() => {
            window.location.reload();
          });
        } else {
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
        <h4>Codes promos</h4>
        {JSON.parse(localStorage.getItem("admin#token")).role == "super-admin" ? (<button onClick={() => navigation("/sidebar/ajout-code-promo")}>Ajouter</button>) : (<div className="select-wrapper">
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
        </div>)}
      </div>
      <div className="content">
        <table id='table'>
          <thead>
            <tr>
              <th className='col1'>N°</th>
              <th className='col3'>Code promo</th>
              <th className='col2'>Label</th>
              <th className='col4'>Valeur</th>
              <th className='col7'>status</th>
              <th className='col6'>Action</th>
            </tr>
          </thead>
          <tbody>
            {(
              !searchValue
                ? codes
                : codes.filter(item =>
                  [
                    "code",
                    "label",
                    "value",
                    "is_active"
                  ].some(key =>
                    item[key]?.toString().toLowerCase().includes(searchValue.toLowerCase())
                  )
                )
            ).map((item, key) => {
              return (
                <tr key={key} /*onClick={() => { setOverlay(true); setOverlayItem(codes.filter((i) => i.id === item.id)[0]) }}*/>
                  <td className='id'>{item.id}</td>
                  <td>{item.code}</td>
                  <td className='label'>{item.label}</td>
                  <td>{item.value + " %"}</td>
                  <td className='status'>{item.is_active == 1 ? (<span className="paid">Actif</span>) : (<span className="expired">Inactif</span>)}
                  </td>
                  {JSON.parse(localStorage.getItem("admin#token")).role == "super-admin" ? (<td className='action'>{item.is_active === 1 ? (<button className='desac' onClick={() => desactiver(item.id)}>Désativer</button>) : (<button className='activ' onClick={() => activer(item.id)}>Activer</button>)}</td>) : <td className='action'></td>}
                </tr>
              )
            })}
          </tbody>
        </table>
        {JSON.parse(localStorage.getItem("admin#token")).role == "super-admin" ? (<div className="header"><div className="select-wrapper">
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
        </div></div>) : ""}
        
      </div>


    </div>
  )
}

