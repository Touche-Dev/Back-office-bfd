import React from 'react'
import { LuUserCheck } from "react-icons/lu";
import { RiUserForbidLine } from "react-icons/ri";
import { LuUserRoundCog } from "react-icons/lu";
import { FaTicketAlt } from "react-icons/fa";
import { useEffect } from 'react';
import axios from "axios"
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers } from "react-icons/fa";
import { BsFiletypePdf } from "react-icons/bs";


export default function Dashboard() {
  const navigation = useNavigate()
  const [inscription, setInscription] = useState([])
  const [inscriptionToday, setInscriptionToday] = useState([])
  const [rapport, setRapport] = useState([])
  const [rapportToday, setRapportToday] = useState([])

  useEffect(() => {
    axios.get("http://localhost:3006/inscription")
      .then((res) => {
        const today = new Date();
        setInscription(res.data)

        const result = res.data.filter(item => {
          const itemDate = new Date(item.created_at.replace(" ", "T"));

          return (
            itemDate.getFullYear() === today.getFullYear() &&
            itemDate.getMonth() === today.getMonth() &&
            itemDate.getDate() === today.getDate()
          );
        });

        setInscriptionToday(result);
      }).catch((err) => {
        console.log(err)
      })
  }, []);







  return (
    <div className='dashboard'>
      <div className="header">
        <h4>Dashboard</h4>
      </div>
      <div className="content">
        <div className="content1">
          <div className="horaire">Aujourd'hui</div>
          <div className="cards">
            <div className="card reussi" onClick={() => navigation("/sidebar/inscription-reussie")}>
              <div className="nbr">
                <span> {(inscriptionToday.filter((item) => item.status == "paid")).length} </span>
                <h5>Inscriptions réussie</h5>
              </div>
              <div className="icon">
                <LuUserCheck className='i' />
              </div>
            </div>
            <div className="card n-finalise" onClick={() => navigation("/sidebar/inscription-non-finalisee")}>
              <div className="nbr">
                <span>{
                  (() => {
                    const allowedStatuses = ["pending", "canceled", "expired"];
                    const excludedStatus = "paid";

                    // regrouper les items par email
                    const emailGroups = {};

                    inscriptionToday.forEach(item => {
                      if (!emailGroups[item.email]) {
                        emailGroups[item.email] = [];
                      }
                      emailGroups[item.email].push(item);
                    });

                    // filtrer les emails
                    const result = Object.values(emailGroups)
                      .filter(items =>
                        !items.some(i => i.status === excludedStatus) &&
                        items.some(i => allowedStatuses.includes(i.status))
                      )
                      .map(items => items[0].email); // garder un seul email

                    return result.length;
                  })()
                }</span>
                <h5>Inscriptions incomplètes</h5>
              </div>
              <div className="icon">
                <LuUserRoundCog className='i' />
              </div>
            </div>

            <div className="card total" onClick={() => navigation("/sidebar/inscription")}>
              <div className="nbr">
                <span>{(inscriptionToday.filter((item) => item.status == "paid")).length +
                  (() => {
                    const allowedStatuses = ["pending", "canceled", "expired"];
                    const excludedStatus = "paid";

                    // regrouper les items par email
                    const emailGroups = {};

                    inscriptionToday.forEach(item => {
                      if (!emailGroups[item.email]) {
                        emailGroups[item.email] = [];
                      }
                      emailGroups[item.email].push(item);
                    });

                    // filtrer les emails
                    const result = Object.values(emailGroups)
                      .filter(items =>
                        !items.some(i => i.status === excludedStatus) &&
                        items.some(i => allowedStatuses.includes(i.status))
                      )
                      .map(items => items[0].email); // garder un seul email

                    return result.length;
                  })()}</span>
                <h5>Total des inscriptions</h5>
              </div>
              <div className="icon">
                <FaUsers className='i' />
              </div>
            </div>
          </div>
        </div>
        <div className="content1">
          <div className="horaire">Total</div>
          <div className="cards">
            <div className="card reussi" onClick={() => navigation("/sidebar/inscription-reussie")}>
              <div className="nbr">
                <span> {(inscription.filter((item) => item.status == "paid")).length} </span>
                <h5>Inscriptions réussies</h5>
              </div>
              <div className="icon">
                <LuUserCheck className='i' />
              </div>
            </div>
            <div className="card n-finalise" onClick={() => navigation("/sidebar/inscription-non-finalisee")} >
              <div className="nbr">
                <span>{
                  (() => {
                    const allowedStatuses = ["pending", "canceled", "expired"];
                    const excludedStatus = "paid";

                    // regrouper les items par email
                    const emailGroups = {};

                    inscription.forEach(item => {
                      if (!emailGroups[item.email]) {
                        emailGroups[item.email] = [];
                      }
                      emailGroups[item.email].push(item);
                    });

                    // filtrer les emails
                    const result = Object.values(emailGroups)
                      .filter(items =>
                        !items.some(i => i.status === excludedStatus) &&
                        items.some(i => allowedStatuses.includes(i.status))
                      )
                      .map(items => items[0].email); // garder un seul email

                    return result.length;
                  })()
                }</span>
                <h5>Inscriptions incomplètes</h5>
              </div>
              <div className="icon">
                <LuUserRoundCog className='i' />
              </div>
            </div>
            <div className="card total" onClick={() => navigation("/sidebar/inscription")}>
              <div className="nbr">
                <span>{(inscription.filter((item) => item.status == "paid")).length +
                  (() => {
                    const allowedStatuses = ["pending", "canceled", "expired"];
                    const excludedStatus = "paid";

                    // regrouper les items par email
                    const emailGroups = {};

                    inscription.forEach(item => {
                      if (!emailGroups[item.email]) {
                        emailGroups[item.email] = [];
                      }
                      emailGroups[item.email].push(item);
                    });

                    // filtrer les emails
                    const result = Object.values(emailGroups)
                      .filter(items =>
                        !items.some(i => i.status === excludedStatus) &&
                        items.some(i => allowedStatuses.includes(i.status))
                      )
                      .map(items => items[0].email);

                    return result.length;
                  })()}</span>
                <h5>Total des inscriptions</h5>
              </div>
              <div className="icon">
                <FaUsers className='i' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
