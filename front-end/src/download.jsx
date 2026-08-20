import { useEffect } from 'react';
import axios from "axios"
import { useState } from 'react';
import { SlUserFemale } from "react-icons/sl";
import { SlUser } from "react-icons/sl";
import { useOutletContext } from "react-router-dom";
import { BsFiletypePdf } from "react-icons/bs";


export default function Download() {
  const [download, setDownload] = useState([])
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
    axios.get("https://africapoliticaloutlook.vercel.app/download")
      .then((res) => {
        setDownload(res.data)
      }).catch((err) => {
        console.log(err)
      })
  }, []);



  return (
    <div className='dashboard inscription stats'>

      <div className="header">
        <h4>Téléchargements Documents APO</h4>
        <div className="select-wrapper">
        </div>
      </div>
      <div className="content">
        <table id='table'>
          <thead>
            <tr>
              <th className='col1'>N°</th>
              <th className='col2'>Document</th>
              <th className='col6'>Page Source</th>
              <th className='col3'>Navigateur</th>
              <th className='col7'>Date</th>
            </tr>
          </thead>
          <tbody>
            {download.map((item, key) => {
              return (
                <tr key={key}>
                  <td>{key + 1}</td>
                  <td className='nom'><div className="icon"><BsFiletypePdf className='i' /></div><span> {item.document_name} </span></td><a href="item.page_url"></a>
                  <td className='pays'><a target='_blank' href={item.page_url}>Lien de la page</a></td>
                  <td className='institution'>{item.browser}</td>
                  <td className='statustd'><span className="paid">{new Date(item.downloaded_at).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}</span></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

    </div>
  )
}

