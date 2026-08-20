import { useEffect } from 'react';
import axios from "axios"
import { useState } from 'react';
import { useOutletContext } from "react-router-dom";

export default function Newsletter() {
  const [newsletter, setnewsletter] = useState([])
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
    axios.get("http://localhost:3006/newsletter")
      .then((res) => {
        setnewsletter(res.data)
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

    pdf.save("Newsletter.pdf");
  }


  function ExportCsv() {
    const headers = ["ID", "Email", "Date"];

    const rows = newsletter.map((item, key) => [
      key + 1,
      item.email,
      `${String(new Date(item.date).getDate()).padStart(2, "0")}/${String(new Date(item.date).getMonth() + 1).padStart(2, "0")}/${new Date(item.date).getFullYear()}`
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
    link.download = "Newsletter.csv";
    link.click();
  }



  return (
    <div className='dashboard newsletter'>
      <div className="header">
        <h4>Newsletter</h4>
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
              <th className='col2'>Email</th>
              <th className='col7'>Date</th>
            </tr>
          </thead>
          <tbody>
            {(
              !searchValue
                ? newsletter
                : newsletter.filter(item =>
                  [
                    "email"
                  ].some(key =>
                    item[key]?.toString().toLowerCase().includes(searchValue.toLowerCase())
                  )
                )
            ).map((item, key) => {
              return (
                <tr key={key}>
                  <td>{item.id}</td>
                  <td><a href={`mailto:${item.email}`}>{item.email}</a></td>
                  <td className='date'>{new Date(item.created_at).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

    </div>
  )
}

