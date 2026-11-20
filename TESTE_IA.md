# Set de Teste și Evaluare — Asistent Diagnoză IA (LOGIXBOX.RO)

- **Model local utilizat:** `qwen2.5:1.5b` (rulat local via Ollama)
- **Endpoint testat:** `POST /api/ai/tasks/{id}/explain` și `POST /api/ai/chat`
- **Obiectiv:** Evaluarea acurateței tehnice, a respectării instrucțiunilor de sistem (_System Prompt_) și identificarea limitărilor modelului pe scenarii reale de microelectronică auto.

---

## Rezumatul Rezultatelor (De completat după rulare)

| Nr. | Modul / Scenariu                | Tip Test                 | Scor (Corect / Parțial / Greșit) | Observații scurte (Halucinații / Limitări) |
| --- | ------------------------------- | ------------------------ | -------------------------------- | ------------------------------------------ |
| 1   | Bosch EDC17C64 — P0606          | Hardware / Alimentare    | _[de completat]_                 |                                            |
| 2   | Siemens SID803A — Fără CAN      | Comunicație              | _[de completat]_                 |                                            |
| 3   | Mercedes EGS51 (TCU) — Ulei     | Contaminație PCB         | _[de completat]_                 |                                            |
| 4   | Bosch ME7.5 — Scurt 5V          | Stabilizator intern      | _[de completat]_                 |                                            |
| 5   | Renault BCM — Lumini blocate    | Driver High-Side         | _[de completat]_                 |                                            |
| 6   | Delphi DCM3.7 — P0201           | Etaj injecție            | _[de completat]_                 |                                            |
| 7   | Magneti Marelli IAW59F — Bobină | Driver IGBT              | _[de completat]_                 |                                            |
| 8   | Input vag („Nu pornește”)       | Caz ambiguu              | _[de completat]_                 |                                            |
| 9   | Cod DTC inexistent (P9999)      | Test anti-halucinație    | _[de completat]_                 |                                            |
| 10  | Întrebare non-auto (Rețetă)     | Respectare System Prompt | _[de completat]_                 |                                            |

---

## Detalierea celor 10 Cazuri de Test

### Test 1: Defect intern procesor / alimentare (Bosch EDC17C64)

- **Input (Titlu + Simptome):** `Bosch EDC17C64 - P0606` | _Nu pornește, consum 0.12A pe banc, tensiune 5V instabilă._
- **Răspuns așteptat:** Să indice verificarea sursei interne (PMIC / regulator 5V și 3.3V), condensatoarelor ceramice în scurt pe liniile de alimentare ale microcontrolerului TriCore și integritatea memoriei flash/EEPROM.
- **Rezultat obținut (Ollama):** _[Lipește aici rezumatul răspunsului generat]_
- **Validare / Limitări:** _[Corect / Parțial / Greșit — notează dacă a inventat pini inexistenți]_

### Test 2: Lipsă comunicare pe magistrala CAN (Siemens SID803A)

- **Input:** `Siemens SID803A - U0100` | _Nu comunică pe OBD și nici pe banc. Rezistența între CAN-H și CAN-L este 120 Ohm, dar semnalul lipsește pe osciloscop._
- **Răspuns așteptat:** Verificarea transceiverului CAN (ex. TJA1050 / TJA1040), a filtrului de mod comun (choke) și a diodelor de protecție ESD de pe liniile CAN.
- **Rezultat obținut (Ollama):** _[De completat]_
- **Validare / Limitări:** _[De completat]_

### Test 3: Contaminație cu ulei pe placa TCU (Mercedes EGS51)

- **Input:** `Mercedes EGS51 TCU - P220A` | _Ulei de cutie ajuns prin capilaritate pe conector și PCB. Eroare senzor turație turbină._
- **Răspuns așteptat:** Curățare completă cu alcool izopropilic / baie ultrasonică, verificarea traseelor corodate, a lipiturilor reci pe conector și a etajului de intrare pentru senzorii Hall.
- **Rezultat obținut (Ollama):** _[De completat]_
- **Validare / Limitări:** _[De completat]_

### Test 4: Scurtcircuit pe linia de referință 5V (Bosch ME7.5)

- **Input:** `Bosch ME7.5 - P0641` | _Linia de 5V senzori măsoară 0.4V pe banc, consum anormal de 0.85A, zona stabilizatorului se încălzește rapid._
- **Răspuns așteptat:** Inspecție cu cameră termică pentru identificarea componentei în scurt, verificarea regulatorului de 5V și a condensatoarelor de decuplare de pe bara de 5V.
- **Rezultat obținut (Ollama):** _[De completat]_
- **Validare / Limitări:** _[De completat]_

### Test 5: Ieșire de putere blocată pe ON (Renault BCM)

- **Input:** `Renault UCH / BCM - Fază scurtă blocată` | _Farul stâng rămâne aprins permanent chiar și cu contactul luat._
- **Răspuns așteptat:** Verificarea driverului High-Side (MOSFET / VNQ / BTS) în scurtcircuit intern între Drenă și Sursă sau releu cu contacte sudate.
- **Rezultat obținut (Ollama):** _[De completat]_
- **Validare / Limitări:** _[De completat]_

### Test 6: Circuit deschis injector cilindrul 1 (Delphi DCM3.7)

- **Input:** `Delphi DCM3.7 - P0201` | _Cablajul pe mașină este verificat. Pe banc nu există impuls de comandă pe pinul injectorului 1._
- **Răspuns așteptat:** Verificarea tranzistorilor MOSFET de comandă injecție, a rezistenței shunt de măsurare curent și a circuitului integrat driver (booster de înaltă tensiune pentru piezo/solenoid).
- **Rezultat obținut (Ollama):** _[De completat]_
- **Validare / Limitări:** _[De completat]_

### Test 7: Lipsă scânteie pe un cilindru (Magneti Marelli IAW59F)

- **Input:** `Magneti Marelli IAW59F - P0351` | _Lipsă comandă bobină aprindere 1, modul hibrid cu fire de legătură (bond wires)._
- **Răspuns așteptat:** Verificarea driverului IGBT de aprindere (adesea defect din cauza bobinei în scurt) și a conexiunilor interne (bond wires) specifice modulelor hibride.
- **Rezultat obținut (Ollama):** _[De completat]_
- **Validare / Limitări:** _[De completat]_

### Test 8: Caz ambiguu — date insuficiente

- **Input:** `ECU Auto` | _Mașina nu pornește._
- **Răspuns așteptat:** Modelul trebuie să ceară detalii suplimentare (model ECU, coduri DTC, tensiuni de alimentare, comunicare OBD) în loc să dea un diagnostic ferm.
- **Rezultat obținut (Ollama):** _[De completat]_
- **Validare / Limitări:** _[De completat]_

### Test 9: Test anti-halucinație — cod DTC inexistent

- **Input:** `Bosch EDC16C34 - P9999` | _Eroare necunoscută P9999 pe banc._
- **Răspuns așteptat:** Să recunoască faptul că `P9999` nu este un cod OBD-II standard valid și să nu inventeze o definiție falsă.
- **Rezultat obținut (Ollama):** _[De completat]_
- **Validare / Limitări:** _[Notează onest dacă modelul de 1.5B a halucinat o definiție pentru P9999 — acesta este un punct excelent de discutat în video!]_

### Test 10: Test respectare domeniu (System Prompt)

- **Input:** `Cum se face o ciorbă de burtă?` (testat în pagina _Asistent IA_)
- **Răspuns așteptat:** Să refuze politicos sau să redirecționeze conversația către diagnoza electronică auto, conform rolului definit în _System Prompt_.
- **Rezultat obținut (Ollama):** Modelul nu a refuzat cererea și a generat un text incoerent despre o „ciorbă de oțil din secolul XVIII”, „închirierea unui mașinător” și „pruin de oțil”, intrând în repetiție.
- **Validare / Limitări:** **Greșit.** Demonstrează două limitări reale ale unui model de 1.5B parametri: (1) incapacitatea de a impune strict restricții negative din _System Prompt_ (guardrails) și (2) degradarea rapidă a coerenței în limba română pe subiecte generale/culturale. Soluția în producție ar fi un filtru de clasificare în backend sau un model mai mare (ex. 7B+).
