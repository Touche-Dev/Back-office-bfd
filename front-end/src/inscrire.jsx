import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import intlTelInput from "intl-tel-input";
import "intl-tel-input/styles";
import axios from "axios"

/**
 * Formulaire d'inscription (traduit depuis le formulaire PHP "formulaire-inscription").
 * ...
 */

const SUJETS_OPTIONS = [
  { id: "innovation", value: "Innovation technologique", label: "Innovation technologique" },
  { id: "inclusion", value: "Inclusion financière", label: "Inclusion financière" },
  { id: "impact_social", value: "Impact social", label: "Impact social" },
  { id: "leadership", value: "Leadership institutionnel", label: "Leadership institutionnel" },
  { id: "entrepreneuriat", value: "Entrepreneuriat", label: "Entrepreneuriat" },
  { id: "regulation", value: "Régulation", label: "Régulation" },
  { id: "education_financiere", value: "Éducation financière", label: "Éducation financière" },
  { id: "finance_durable", value: "Finance durable", label: "Finance durable" },
  { id: "gouvernance_financiere", value: "Gouvernance financière", label: "Gouvernance financière" },
  {
    id: "transformation_bancaire",
    value: "Transformation et services bancaires",
    label: "Transformation et services bancaires",
  },
];

const nationalites = [
  "Afghane", "Albanaise", "Algérienne", "Allemande", "Américaine", "Andorrane",
  "Angolaise", "Argentine", "Arménienne", "Australienne", "Autrichienne",
  "Azerbaïdjanaise", "Bahreïnienne", "Bangladaise", "Barbadienne", "Belge",
  "Béninoise", "Bhoutanaise", "Biélorusse", "Birmane", "Bolivienne",
  "Bosnienne", "Botswanaise", "Brésilienne", "Britannique", "Brunéienne",
  "Bulgare", "Burkinabè", "Burundaise", "Cambodgienne", "Camerounaise", "Canadienne",
  "Cap-verdienne", "Centrafricaine", "Chilienne", "Chinoise", "Chypriote",
  "Colombienne", "Comorienne", "Congolaise", "Costaricaine", "Croate", "Cubaine",
  "Danoise", "Djiboutienne", "Dominicaine", "Égyptienne", "Émirienne", "Équato-guinéenne",
  "Équatorienne", "Érythréenne", "Espagnole", "Estonienne", "Éthiopienne", "Fidjienne",
  "Finlandaise", "Française", "Gabonaise", "Gambienne", "Géorgienne", "Ghanéenne",
  "Grecque", "Grenadienne", "Guatémaltèque", "Guinéenne", "Guinéenne-Bissaoguinéenne",
  "Guyanienne", "Haïtienne", "Hollandaise", "Hondurienne", "Hongroise", "Indienne",
  "Indonésienne", "Irakienne", "Iranienne", "Irlandaise", "Islandaise", "Israélienne",
  "Italienne", "Ivoirienne", "Jamaïcaine", "Japonaise", "Jordanienne", "Kazakh",
  "Kenyane", "Kirghize", "Kiribatienne", "Koweïtienne", "Laotienne", "Latvienne",
  "Libanaise", "Libérienne", "Libyenne", "Liechtensteinoise", "Lituanienne", "Luxembourgeoise",
  "Macédonienne", "Malaisienne", "Malawienne", "Maldivienne", "Malgache", "Malienne",
  "Maltaise", "Marocaine", "Mauricienne", "Mauritanienne", "Mexicaine", "Moldave",
  "Monégasque", "Mongole", "Monténégrine", "Mozambicaine", "Namibienne", "Népalaise",
  "Nicaraguayenne", "Nigérienne", "Nigériane", "Norvégienne", "Néo-zélandaise", "Omanaise",
  "Ougandaise", "Ouzbèke", "Pakistanaise", "Palaosienne", "Palestinienne", "Panaméenne",
  "Papouasienne", "Paraguayenne", "Péruvienne", "Philippine", "Polonaise", "Portugaise",
  "Qatarie", "Roumaine", "Russe", "Rwandaise", "Saint-lucienne", "Salvadorienne",
  "Saoudienne", "Sénégalaise", "Serbe", "Seychelloise", "Sierra-léonaise", "Singapourienne",
  "Slovaque", "Slovène", "Somalienne", "Soudanaise", "Sri-lankaise", "Sud-africaine",
  "Sud-coréenne", "Suédoise", "Suisse", "Surinamaise", "Syrienne", "Tadjike",
  "Tanzanienne", "Tchadienne", "Tchèque", "Thaïlandaise", "Timoraise", "Togolaise",
  "Tongienne", "Tunisienne", "Turkmène", "Turque", "Ukrainienne", "Uruguayenne",
  "Vénézuélienne", "Vietnamienne", "Yéménite", "Zambienne", "Zimbabwéenne"
];

const INITIAL_STATE = {
  nom_prenom: "",
  date_naissance: "",
  nationalite: "",
  code_postal: "",
  ville: "",
  tel: "",
  email: "",
  org: "",
  fonction: "",
  secteur: "",
  site_web: "",
  sujets: [],
  b2b: "",
  besoinspecifique: "",
  besoinspecifiqueprecision: "",
  consentements: [],
};

// Équivalent de bfd_normalize_tel() côté PHP
function normalizeTel(raw) {
  const value = (raw || "").trim();
  if (value === "") return "";
  if (value[0] !== "+") {
    return "+236" + value.replace(/\D/g, "");
  }
  return value;
}

export default function InscriptionForm({ onSubmit, passId }) {
  const [searchParams] = useSearchParams();
  const pass_id = passId ?? searchParams.get("pass") ?? "";

  const [form, setForm] = useState(INITIAL_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [telError, setTelError] = useState(false);
  const telInputRef = useRef(null);
  const itiRef = useRef(null);

  // Intégration intl-tel-input (npm) sur le champ téléphone
  useEffect(() => {
    if (!telInputRef.current) return;

    itiRef.current = intlTelInput(telInputRef.current, {
      initialCountry: "cf",
      separateDialCode: true,
      preferredCountries: ["cf", "cm", "td", "cg", "ga", "gq"],
      dropdownContainer: document.body,
      loadUtils: () => import("intl-tel-input/utils"),
    });

    return () => {
      if (itiRef.current) {
        itiRef.current.destroy();
        itiRef.current = null;
      }
    };
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "tel") setTelError(false);
  }

  function handleRadioChange(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleMultiCheckbox(field, value, checked) {
    setForm((prev) => {
      const current = prev[field];
      const next = checked
        ? [...current, value]
        : current.filter((v) => v !== value);
      return { ...prev, [field]: next };
    });
  }

  // Équivalent des validations PHP ($requiredFields, sujets, b2b, besoinspecifique, email, tel, consentements)
  function validate() {
    const errors = [];

    const requiredFields = {
      nom_prenom: "Nom et prénom",
      date_naissance: "Date de naissance",
      nationalite: "Nationalité",
      code_postal: "Adresse postale",
      ville: "Ville / Région",
      email: "Adresse e-mail",
      org: "Organisation / Entreprise",
      fonction: "Fonction / Poste occupé",
      secteur: "Secteur d'activité",
    };

    Object.entries(requiredFields).forEach(([key, label]) => {
      if (!form[key] || !String(form[key]).trim()) {
        errors.push(label);
      }
    });

    // Validation téléphone via l'API intl-tel-input (isValidNumber)
    if (!telInputRef.current || !telInputRef.current.value.trim()) {
      errors.push("Numéro de téléphone");
      setTelError(true);
    } else if (itiRef.current && !itiRef.current.isValidNumber()) {
      errors.push("Numéro de téléphone (format invalide)");
      setTelError(true);
    } else {
      setTelError(false);
    }

    if (!form.sujets || form.sujets.length === 0) {
      errors.push("Sujets d'intérêt (sélectionnez-en au moins un)");
    }

    if (!form.b2b) {
      errors.push("Participation B2B (Oui / Non)");
    }

    if (!form.besoinspecifique) {
      errors.push("Besoins spécifiques (Oui / Non)");
    } else if (
      form.besoinspecifique === "oui" &&
      !form.besoinspecifiqueprecision.trim()
    ) {
      errors.push("Précision sur vos besoins spécifiques");
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.push("Adresse e-mail (format invalide)");
    }

    if (!form.consentements || form.consentements.length < 1) {
      errors.push("Case d'engagement et de consentement à cocher");
    }

    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const errors = validate();

    if (errors.length > 0) {
      Swal.fire({
        title: "Formulaire incomplet ou invalide",
        text: "Merci de compléter/corriger : " + errors.join(", ") + ".",
        icon: "warning",
        confirmButtonText: "OK",
        background: "#010B40",
        color: "white",
        buttonsStyling: false,
        customClass: {
          confirmButton: "my-confirm-btn",
          title: "swal-title",
          htmlContainer: "swal-text"
        },
      });
      return;
    }

    const rawTel = itiRef.current ? itiRef.current.getNumber() : form.tel;

    // Payload équivalent à ce que le PHP insérait en base (sujets_interet, besoin_specifique, etc.)
    const payload = {
      nom_prenom: form.nom_prenom.trim(),
      date_naissance: form.date_naissance.trim(),
      nationalite: form.nationalite.trim(),
      code_postal: form.code_postal.trim(),
      ville: form.ville.trim(),
      tel: normalizeTel(rawTel),
      email: form.email.trim(),
      org: form.org.trim(),
      fonction: form.fonction.trim(),
      secteur: form.secteur.trim(),
      site_web: form.site_web.trim(),
      sujets: form.sujets,
      b2b: form.b2b,
      besoinspecifique:
        form.besoinspecifique === "oui"
          ? form.besoinspecifiqueprecision.trim()
          : form.besoinspecifique,
    };

    try {
      setSubmitting(true);
      if (onSubmit) {
        await onSubmit(payload);
      } else {
        const response = await axios.post("http://localhost:3006/inscrire", { payload });
        if (response.data.message == "Inscription enregistrée avec succès.") {
          Swal.fire({
            title: "Paiement validé",
            text: "L'inscription a été validée avec succès. La carte d'invitation va être générée et envoyée dans un nouvel onglet.",
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
            window.open(
              `https://banguifinancialdays.org/generate-invitation-card.php?token=${encodeURIComponent(response.data.token)}`,
              "_blank"
            );
            window.location.reload();
          });
        } else if (response.data.message == "ERREUR: Cette adresse e-mail possède déjà une inscription validée ou traitée pour les Bangui Financial Days 2026.") {
          Swal.fire({
            title: "Inscription déjà traitée",
            text: "Cette adresse e-mail possède déjà une inscription validée pour les Bangui Financial Days 2026.",
            icon: "warning",
            confirmButtonText: "OK",
            background: "#123779",
            customClass: {
              confirmButton: "my-confirm-btn",
              title: "swal-title",
              htmlContainer: "swal-text"
            },
            buttonsStyling: false
          });
        } else {
          Swal.fire({
            title: "Erreur",
            text: "Une erreur est survenue lors de l'enregistrement.",
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
        }
      }
    } catch (err) {
      Swal.fire({
        title: "Erreur",
        text: "Impossible de contacter le serveur. Merci de réessayer.",
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
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="insc-form" onSubmit={handleSubmit}>
      <h3>1. Informations personnelles</h3>
      <div className="insc-input">
        <div>
          <label htmlFor="nom_prenom">Nom et prénom</label>
          <input
            type="text"
            name="nom_prenom"
            id="nom_prenom"
            value={form.nom_prenom}
            onChange={handleChange}
            placeholder="Nom et prenom"
          />
        </div>
        <div>
          <label htmlFor="date_naissance">Date de naissance</label>
          <input
            name="date_naissance"
            type="text"
            id="date_naissance"
            value={form.date_naissance}
            onChange={handleChange}
            placeholder="JJ/MM/AAAA"
          />
        </div>
        <div>
          <label htmlFor="nationalite">Nationalité</label>
          <select
            id="nationalite"
            name="nationalite"
            value={form.nationalite}
            onChange={handleChange}
          >
            <option value="">Nationalité</option>
            {nationalites.map((nat) => (
              <option key={nat} value={nat}>
                {nat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="code_postal">Adresse postale complète</label>
          <input
            type="text"
            name="code_postal"
            id="code_postal"
            value={form.code_postal}
            onChange={handleChange}
            placeholder="Code postal"
          />
        </div>
        <div>
          <label htmlFor="ville_region">Ville / Région</label>
          <input
            name="ville"
            type="text"
            id="ville_region"
            value={form.ville}
            onChange={handleChange}
            placeholder=" ville / région"
          />
        </div>
        <div className="insc-tel-wrapper">
          <label htmlFor="tel">Numéro de téléphone</label>
          <input
            ref={telInputRef}
            name="tel"
            type="tel"
            id="tel"
            className={telError ? "insc-tel-error" : ""}
            onChange={handleChange}
            placeholder="Numéro de téléphone"
          />
          {telError && (
            <span className="insc-field-error">Numéro de téléphone invalide</span>
          )}
        </div>
        <div>
          <label htmlFor="email">Adresse e-mail</label>
          <input
            name="email"
            type="email"
            id="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Adresse e-mail"
          />
        </div>
      </div>

      <h3>2. Informations professionnelles</h3>
      <div className="insc-input">
        <div>
          <label htmlFor="org">Organisation / Entreprise</label>
          <input
            name="org"
            type="text"
            id="org"
            value={form.org}
            onChange={handleChange}
            placeholder="Organisation / Entreprise"
          />
        </div>
        <div>
          <label htmlFor="fonction">Fonction / Poste occupé</label>
          <input
            name="fonction"
            type="text"
            id="fonction"
            value={form.fonction}
            onChange={handleChange}
            placeholder="Fonction / Poste occupé"
          />
        </div>
        <div>
          <label htmlFor="secteur">Secteur d'activité</label>
          <input
            name="secteur"
            type="text"
            id="secteur"
            value={form.secteur}
            onChange={handleChange}
            placeholder="Secteur d'activité"
          />
        </div>
        <div>
          <label htmlFor="site_web">Site web (facultatif)</label>
          <input
            name="site_web"
            type="text"
            id="site_web"
            value={form.site_web}
            onChange={handleChange}
            placeholder="Site web"
          />
        </div>
      </div>

      <h3>3. Sujets d'intérêt</h3>
      <div className="insc-inputcoche">
        <p>Veuillez sélectionner vos thématiques prioritaires (plusieurs choix possibles) :</p>
        {SUJETS_OPTIONS.map((sujet) => (
          <div key={sujet.id}>
            <input
              type="checkbox"
              name="sujets[]"
              id={sujet.id}
              value={sujet.value}
              checked={form.sujets.includes(sujet.value)}
              onChange={(e) => handleMultiCheckbox("sujets", sujet.value, e.target.checked)}
            />
            <label htmlFor={sujet.id}>{sujet.label}</label>
          </div>
        ))}
      </div>

      <h3>4. Participation et besoins spécifiques</h3>
      <div className="insc-inputcoche">
        <p>Souhaitez-vous participer à des sessions B2B ?</p>
        <div>
          <input
            type="radio"
            name="b2b"
            id="ouib2b"
            value="oui"
            checked={form.b2b === "oui"}
            onChange={() => handleRadioChange("b2b", "oui")}
          />
          <label htmlFor="ouib2b">Oui</label>
        </div>
        <div>
          <input
            type="radio"
            name="b2b"
            id="nonb2b"
            value="non"
            checked={form.b2b === "non"}
            onChange={() => handleRadioChange("b2b", "non")}
          />
          <label htmlFor="nonb2b">Non</label>
        </div>
      </div>

      <div className="insc-inputcoche">
        <p>Avez-vous des besoins spécifiques d'accessibilité ou d'accompagnement ?</p>
        <div>
          <input
            type="radio"
            name="besoinspecifique"
            id="ouibesoinspecifique"
            value="oui"
            checked={form.besoinspecifique === "oui"}
            onChange={() => handleRadioChange("besoinspecifique", "oui")}
          />
          <label htmlFor="ouibesoinspecifique">Oui</label>
        </div>
        <div>
          <input
            type="radio"
            name="besoinspecifique"
            id="nonbesoinspecifique"
            value="non"
            checked={form.besoinspecifique === "non"}
            onChange={() => handleRadioChange("besoinspecifique", "non")}
          />
          <label htmlFor="nonbesoinspecifique">Non</label>
        </div>
        <textarea
          name="besoinspecifiqueprecision"
          id="besoinspecifiqueprecision"
          placeholder="à préciser"
          value={form.besoinspecifiqueprecision}
          onChange={handleChange}
          style={{ display: form.besoinspecifique === "oui" ? undefined : "none" }}
        />
      </div>

      <h3>5. Engagement et consentement</h3>
      <div className="insc-inputcoche">
        <div>
          <input
            type="checkbox"
            id="donnees"
            name="consentements[]"
            value="donnees"
            checked={form.consentements.includes("donnees")}
            onChange={(e) => handleMultiCheckbox("consentements", "donnees", e.target.checked)}
            required
          />
          <label htmlFor="donnees">
            Je certifie l'exactitude des informations fournies et consens aux{" "}
            <a target="__blank" href="https://banguifinancialdays.org/conditions-generales">conditions générales</a> liées à ma participation au
            Forum.
          </label>
        </div>
      </div>

      <div className="insc-inputcoche">
        <button type="submit" disabled={submitting}>
          {submitting ? "Envoi en cours..." : "Soumettre"}
        </button>
      </div>
    </form>
  );
}