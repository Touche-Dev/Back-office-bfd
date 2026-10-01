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

// Statuts considérés comme "payés" / validés
const PAID_STATUSES = ["paid", "manuelle", "organisateur", "sponsor", "partenaire", "institutionnel", "media"];

export default function Dashboard() {
  const navigation = useNavigate()
  const [inscription, setInscription] = useState([])
  const [inscriptionToday, setInscriptionToday] = useState([])
  const [rapport, setRapport] = useState([])
  const [rapportToday, setRapportToday] = useState([])

  useEffect(() => {
    axios.get("https://back-office-bfd.vercel.app/inscription")
      .then((res) => {
        const today = new Date();
        if (JSON.parse(localStorage.getItem("admin#token")).role == "super-admin") {
          setInscription(res.data)
        } else {
          setInscription(
            res.data.filter((i) => i.payment_type === "physique")
          );
        }


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
                <span> {(inscriptionToday.filter((item) => PAID_STATUSES.includes(item.status))).length} </span>
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
                    const allowedStatuses = ["pending", "canceled", "expired", "failed"];

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
                        !items.some(i => PAID_STATUSES.includes(i.status)) &&
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
                <span>{(inscriptionToday.filter((item) => PAID_STATUSES.includes(item.status))).length +
                  (() => {
                    const allowedStatuses = ["pending", "canceled", "expired", "failed"];

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
                        !items.some(i => PAID_STATUSES.includes(i.status)) &&
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
          <div className="recaps">

            {/* Récap : réussi */}
            <div className="recap">
              <h4 className="recap-title">Récapitulatif par type de participant (Réussi)</h4>
              <ul className="recap-list">
                <li>
                  <span className="recap-label"><span className="dot participant"></span>Participants</span>
                  <strong>
                    {inscriptionToday.filter((item) => ["paid", "manuelle"].includes(item.status)).length}
                  </strong>
                </li>
                <li>
                  <span className="recap-label"><span className="dot organisateur"></span>Organisateurs</span>
                  <strong>{inscriptionToday.filter((item) => ["organisateur"].includes(item.status)).length}</strong>
                </li>
                <li>
                  <span className="recap-label"><span className="dot partenaire"></span>Partenaires</span>
                  <strong>{inscriptionToday.filter((item) => ["partenaire"].includes(item.status)).length}</strong>
                </li>
                <li>
                  <span className="recap-label"><span className="dot vip"></span>VIP</span>
                  <strong>{inscriptionToday.filter((item) => ["vip"].includes(item.status)).length}</strong>
                </li>
                <li>
                  <span className="recap-label"><span className="dot institutionnel"></span>Institutionnel</span>
                  <strong>{inscriptionToday.filter((item) => ["institutionnel"].includes(item.status)).length}</strong>
                </li>
                <li>
                  <span className="recap-label"><span className="dot media"></span>Médias</span>
                  <strong>{inscriptionToday.filter((item) => ["media"].includes(item.status)).length}</strong>
                </li>
              </ul>
            </div>

            {/* Récap : non finalisé */}
            <div className="recap">
              <h4 className="recap-title">Récapitulatif par type de participant (Non-finalisé)</h4>
              <ul className="recap-list">
                <li>
                  <span className="recap-label"><span className="dot participant"></span>Participants</span>
                  <strong>{
                    (() => {
                      const allowedStatuses = ["pending", "canceled", "expired", "failed"];

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
                          !items.some(i => PAID_STATUSES.includes(i.status)) &&
                          items.some(i => allowedStatuses.includes(i.status))
                        )
                        .map(items => items[0].email); // garder un seul email

                      return result.length;
                    })()
                  }</strong>
                </li>
                <li>
                  <span className="recap-label"><span className="dot organisateur"></span>Organisateurs</span>
                  <strong>0</strong>
                </li>
                <li>
                  <span className="recap-label"><span className="dot partenaire"></span>Partenaires</span>
                  <strong>0</strong>
                </li>
                <li>
                  <span className="recap-label"><span className="dot vip"></span>VIP</span>
                  <strong>0</strong>
                </li>
                <li>
                  <span className="recap-label"><span className="dot institutionnel"></span>Institutionnel</span>
                  <strong>0</strong>
                </li>
                <li>
                  <span className="recap-label"><span className="dot media"></span>Médias</span>
                  <strong>0</strong>
                </li>
              </ul>
            </div>

          </div>
        </div>
        <div className="content1">
          <div className="horaire">Total</div>
          <div className="cards">
            <div className="card reussi" onClick={() => navigation("/sidebar/inscription-reussie")}>
              <div className="nbr">
                <span> {(inscription.filter((item) => PAID_STATUSES.includes(item.status))).length} </span>
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
                    const allowedStatuses = ["pending", "canceled", "expired", "failed"];

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
                        !items.some(i => PAID_STATUSES.includes(i.status)) &&
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
                <span>{(inscription.filter((item) => PAID_STATUSES.includes(item.status))).length +
                  (() => {
                    const allowedStatuses = ["pending", "canceled", "expired", "failed"];

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
                        !items.some(i => PAID_STATUSES.includes(i.status)) &&
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
          <div className="recaps">

            {/* Récap : réussi */}
            <div className="recap">
              <h4 className="recap-title">Récapitulatif par type de participant (Réussi)</h4>
              <ul className="recap-list">
                <li>
                  <span className="recap-label"><span className="dot participant"></span>Participants</span>
                  <strong>
                    {inscription.filter((item) => ["paid", "manuelle"].includes(item.status)).length}
                  </strong>
                </li>
                <li>
                  <span className="recap-label"><span className="dot organisateur"></span>Organisateurs</span>
                  <strong>{inscription.filter((item) => ["organisateur"].includes(item.status)).length}</strong>
                </li>
                <li>
                  <span className="recap-label"><span className="dot partenaire"></span>Partenaires</span>
                  <strong>{inscription.filter((item) => ["partenaire"].includes(item.status)).length}</strong>
                </li>
                <li>
                  <span className="recap-label"><span className="dot vip"></span>VIP</span>
                  <strong>{inscription.filter((item) => ["vip"].includes(item.status)).length}</strong>
                </li>
                <li>
                  <span className="recap-label"><span className="dot institutionnel"></span>Institutionnel</span>
                  <strong>{inscription.filter((item) => ["institutionnel"].includes(item.status)).length}</strong>
                </li>
                <li>
                  <span className="recap-label"><span className="dot media"></span>Médias</span>
                  <strong>{inscription.filter((item) => ["media"].includes(item.status)).length}</strong>
                </li>
              </ul>
            </div>

            {/* Récap : non finalisé */}
            <div className="recap">
              <h4 className="recap-title">Récapitulatif par type de participant (Non-finalisé)</h4>
              <ul className="recap-list">
                <li>
                  <span className="recap-label"><span className="dot participant"></span>Participants</span>
                  <strong>{
                    (() => {
                      const allowedStatuses = ["pending", "canceled", "expired", "failed"];

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
                          !items.some(i => PAID_STATUSES.includes(i.status)) &&
                          items.some(i => allowedStatuses.includes(i.status))
                        )
                        .map(items => items[0].email); // garder un seul email

                      return result.length;
                    })()
                  }</strong>
                </li>
                <li>
                  <span className="recap-label"><span className="dot organisateur"></span>Organisateurs</span>
                  <strong>0</strong>
                </li>
                <li>
                  <span className="recap-label"><span className="dot partenaire"></span>Partenaires</span>
                  <strong>0</strong>
                </li>
                <li>
                  <span className="recap-label"><span className="dot vip"></span>VIP</span>
                  <strong>0</strong>
                </li>
                <li>
                  <span className="recap-label"><span className="dot institutionnel"></span>Institutionnel</span>
                  <strong>0</strong>
                </li>
                <li>
                  <span className="recap-label"><span className="dot media"></span>Médias</span>
                  <strong>0</strong>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}