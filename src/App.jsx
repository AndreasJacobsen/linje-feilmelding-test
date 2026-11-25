import { Button } from "@entur/button";
import { Dropdown } from "@entur/dropdown";
import { TextField } from "@entur/form";
import formPackage from "@entur/form/package.json";
import dropdownPackage from "@entur/dropdown/package.json";
import { useEffect, useId, useRef, useState } from "react";

const ERROR = "Det er obligatorisk å ha en favorittkake når du jobber hos Entur";
const CAKES = [
  { value: "bløtkake", label: "Bløtkake" },
  { value: "gulrotkake", label: "Gulrotkake" },
  { value: "sjokoladekake", label: "Sjokoladekake" },
];

function AriaInspector({ targetRef }) {
  const [text, setText] = useState("");
  useEffect(() => {
    const read = () => {
      const field = targetRef.current?.querySelector("[role=combobox], input, textarea");
      if (!field) return;
      const describedBy = field.getAttribute("aria-describedby");
      const descriptions = (describedBy ?? "")
        .split(/\s+/)
        .filter(Boolean)
        .map((id) => `  #${id}: ${document.getElementById(id)?.textContent ?? "(finnes ikke i DOM)"}`);
      setText(
        [
          `aria-invalid: ${field.getAttribute("aria-invalid")}`,
          `aria-describedby: ${describedBy ?? "(mangler)"}`,
          ...descriptions,
        ].join("\n"),
      );
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(targetRef.current, { subtree: true, attributes: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, [targetRef]);
  return <pre aria-hidden="true">{text}</pre>;
}

function TextFieldOnSubmit({ manualLink }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(null);
  const feedbackId = useId();
  const wrapperRef = useRef(null);
  const linkProps = manualLink
    ? { feedbackProps: { id: feedbackId }, "aria-describedby": error ? feedbackId : undefined }
    : {};
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setError(value.trim() ? null : ERROR);
      }}
    >
      <div ref={wrapperRef}>
        <TextField
          label="Favorittkake"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          variant={error ? "negative" : undefined}
          feedback={error ?? undefined}
          {...linkProps}
        />
      </div>
      <Button variant="primary" type="submit" width="auto">
        Send
      </Button>
      <AriaInspector targetRef={wrapperRef} />
    </form>
  );
}

function StaticErrorTextField() {
  const wrapperRef = useRef(null);
  return (
    <div ref={wrapperRef}>
      <TextField label="Favorittkake" defaultValue="" variant="negative" feedback={ERROR} />
      <AriaInspector targetRef={wrapperRef} />
    </div>
  );
}

function DropdownOnSubmit() {
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);
  const wrapperRef = useRef(null);
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setError(selected ? null : "Du må velge en kake");
      }}
    >
      <div ref={wrapperRef}>
        <Dropdown
          label="Favorittkake"
          items={CAKES}
          selectedItem={selected}
          onChange={setSelected}
          variant={error ? "negative" : undefined}
          feedback={error ?? undefined}
        />
      </div>
      <Button variant="primary" type="submit" width="auto">
        Send
      </Button>
      <AriaInspector targetRef={wrapperRef} />
    </form>
  );
}

export function App() {
  return (
    <main>
      <h1>Feilmelding i Linje-skjemafelt</h1>
      <p>
        @entur/form {formPackage.version}, @entur/dropdown {dropdownPackage.version}, rett fra npm. Den grå boksen
        under hvert felt viser ARIA-attributtene på input-elementet og er skjult for skjermlesere.
      </p>

      <section>
        <h2>1. TextField: feil ved innsending, uten egen kobling</h2>
        <p>Trykk Send med tomt felt, og gå så tilbake til feltet med Shift+Tab.</p>
        <TextFieldOnSubmit manualLink={false} />
        
      </section>

      <section>
        <h2>2. TextField: feil vises fra start</h2>
        <p>Som eksempelet på linje.entur.no. Ingen endring skjer, så role=status leser ingenting opp.</p>
        <StaticErrorTextField />
      </section>

      <section>
        <h2>3. TextField: med vår løsning (feedbackProps-id og aria-describedby)</h2>
        <p>Slik gjør Reisevaner det i dag. Sammenlign med 1.</p>
        <TextFieldOnSubmit manualLink />
      </section>

      <section>
        <h2>4. Dropdown: feil ved innsending</h2>
        <p>Trykk Send uten å velge, og gå så tilbake til feltet.</p>
        <DropdownOnSubmit />
      </section>
    </main>
  );
}
