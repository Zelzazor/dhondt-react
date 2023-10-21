import { FormEvent, useState } from "react";
import { SketchPicker } from "react-color";

interface Party {
  id: string;
  name: string;
  color: string;
  votes?: number;
  seats?: number;
}

function App() {
  const [parties, setParties] = useState<Party[]>([]);
  const [results, setResults] = useState<Party[]>([]);
  const [color, setColor] = useState<string>("#000000");
  const [formVisible, setFormVisible] = useState<boolean>(false);

  function addParty(newParty: Party) {
    if (
      parties.find(
        (party) =>
          party.name === newParty.name || party.color === newParty.color
      )
    )
      return;
    setParties((parties) => [...parties, newParty]);
    setFormVisible(false);
  }

  function onAddSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const id = crypto.randomUUID();
    const data = new FormData(e.currentTarget);
    const name = data.get("name")?.toString() ?? "";

    const party: Party = {
      id,
      name,
      color,
    };

    addParty(party);
  }

  function calculateDhondt(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const seats = Number(data.get("seats")?.toString());
    const partyVotes = parties.map((party) => ({
      ...party,
      votes: Number(data.get(`${party.id}-votes`)?.toString()),
    }));

    const partiesResults = [];

    for (let i = 1; i <= seats; i++) {
      for (const party of partyVotes) {
        const votes = party.votes / i;
        partiesResults.push({
          ...party,
          votes,
        });
      }
    }

    partiesResults.sort((a, b) => b.votes - a.votes);

    partiesResults.splice(seats);

    const resultSorted = [];

    for (const party of partiesResults) {
      const seats = partiesResults.reduce(
        (acc, cur) => (cur.id === party.id ? acc + 1 : acc),
        0
      );

      resultSorted.push({
        ...party,
        seats,
      });
    }

    resultSorted.sort((a, b) => {
      let alpha = 0;
      if (a.name < b.name) alpha = -1;
      if (a.name > b.name) alpha = 1;

      return b.seats - a.seats || alpha;
    });

    setResults(resultSorted);
  }

  return (
    <>
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-5">Simple D'Hondt Calculator</h1>
        <button
          onClick={() => setFormVisible((formVisible) => !formVisible)}
          className="bg-blue-500 text-white p-2 w-full rounded-lg mb-3"
        >
          {formVisible ? "Hide form" : "Create Party"}
        </button>
        {formVisible && (
          <form
            onSubmit={(e) => onAddSubmit(e)}
            className="flex flex-col gap-2 items-center"
          >
            <div className="w-full">
              <label htmlFor="name">Party name</label>
              <input
                type="text"
                name="name"
                required
                id="name"
                className="w-full border rounded-lg border-black p-1"
              />
            </div>
            <SketchPicker
              onChange={(color) => setColor(color.hex)}
              color={color}
            />
            <button
              type="submit"
              className="bg-green-500 text-white p-2 w-full rounded-lg mb-3"
            >
              Add party
            </button>
          </form>
        )}
        <hr />
        <form onSubmit={calculateDhondt}>
          <ul className="flex flex-col">
            {parties.map((party) => (
              <li
                key={party.id}
                className="flex py-3 px-1 border my-1 justify-between items-center"
              >
                <div>{party.name}</div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    className="border rounded-lg border-black p-1"
                    required
                    name={`${party.id}-votes`}
                    placeholder="Votes earned"
                  />
                  <div
                    style={{ backgroundColor: party.color }}
                    className="w-20 h-20 rounded"
                  ></div>
                </div>
              </li>
            ))}
          </ul>
          <input
            type="number"
            name="seats"
            required
            className="w-full border rounded-lg border-black p-1 mb-3"
            placeholder="Seats number"
          />
          <button
            type="submit"
            className="bg-green-500 text-white p-2 w-full rounded-lg mb-3"
          >
            Calculate
          </button>
        </form>
        {results.length > 0 && (
          <>
            <div className="flex gap-2 flex-wrap mb-5">
              {results.map((party) => (
                <div
                  key={`${party.id}-${party.votes}`}
                  style={{ backgroundColor: party.color }}
                  className="w-5 h-5 rounded"
                ></div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default App;
