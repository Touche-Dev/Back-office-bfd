import { useState } from 'react'
import { Routes, Route } from "react-router-dom";
import Login from './login';
import Dashboard from './dashboard';
import Sidebar from './sidebar';
import Inscription from './inscription';
import InscriptionNonFinalisee from './inscription-non-finalisee';
import InscriptionReussie from './inscription-reussie';
import CodePromo from './code-promo';
import Newsletter from './newsletter';
import Password from './password';
import Logout from './logout';
import InscriptionPromo from './inscription-promo';
import AjoutCodePromo from './ajouter-code-promo';
import Message from './message';
import Download from './download';
import Inscrire from './inscrire';
import './App.css'

function App() {


  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/sidebar" element={<Sidebar />}>
        <Route path="dashboard" element={<Dashboard />}/>
        <Route path="inscription" element={<Inscription />} />
        <Route path="inscription-reussie" element={<InscriptionReussie />} />
        <Route path="inscription-non-finalisee" element={<InscriptionNonFinalisee />} />
        <Route path="inscrire" element={<Inscrire/>} />
        <Route path="message" element={<Message />} />
        <Route path="newsletter" element={<Newsletter />} />
        <Route path="password" element={<Password />} />
        <Route path="logout" element={<Logout />} />
        <Route path="download" element={<Download />} />
      </Route>
    </Routes>
  )
}

export default App
