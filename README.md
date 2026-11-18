# UniPlay Milano

Applicazione React + Vite esportabile e apribile direttamente in Visual Studio Code.

## Avvio locale

Requisiti: Node.js 24 e pnpm.

```bash
pnpm install
pnpm dev
```

## Iscrizioni

- Ogni evento apre `#/register?tournament=...`.
- La pagina di iscrizione legge il parametro `tournament` e salva nome, cognome, squadra, telefono, email e torneo.
- I dati sono persistenti nel browser tramite `localStorage`.
- L’area riservata mostra il nome della squadra, permette ricerca, filtro, eliminazione ed esportazione CSV.

## Collegamento futuro al backend

La persistenza è isolata in `src/services/registrationRepository.ts`. Quando il backend sarà pronto,
sostituisci i metodi `list` e `save` con chiamate HTTP alla tua API, mantenendo il tipo
`Registration`.

Una possibile API minima:

```text
GET    /api/registrations
POST   /api/registrations
DELETE /api/registrations/:id
```

Il corpo della richiesta `POST` può usare questa struttura:

```json
{
  "first": "Mario",
  "last": "Rossi",
  "team": "UniPlay Team",
  "email": "mario@universita.it",
  "phone": "+39 333 123 4567",
  "tournament": "Beach Volley"
}
```
