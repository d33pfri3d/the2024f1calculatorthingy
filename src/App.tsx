import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Trophy } from "lucide-react";

const races = [
  { name: "Brazil Sprint", isSprint: true, flag: "🇧🇷" },
  { name: "Brazil", isSprint: false, flag: "🇧🇷" },
  { name: "Las Vegas", isSprint: false, flag: "🇺🇸" },
  { name: "Qatar Sprint", isSprint: true, flag: "🇶🇦" },
  { name: "Qatar", isSprint: false, flag: "🇶🇦" },
  { name: "Abu Dhabi", isSprint: false, flag: "🇦🇪" },
];

const drivers = ["Max Verstappen", "Lando Norris"] as const;
type Driver = (typeof drivers)[number];

const driverLogos: Record<Driver, string> = {
  "Max Verstappen": "/mv.png",
  "Lando Norris": "/ln.svg",
};

const initialPoints: Record<Driver, number> = {
  "Max Verstappen": 362,
  "Lando Norris": 315,
};

const initialPositions: Record<Driver, Record<string, string>> = {
  "Max Verstappen": { "Brazil Sprint": "4" },
  "Lando Norris": { "Brazil Sprint": "1" },
};

export default function WDCCalculator() {
  const [results, setResults] = useState<Record<Driver, number>>(initialPoints);
  const [positions, setPositions] =
    useState<Record<Driver, Record<string, string>>>(initialPositions);
  const [fastestLaps, setFastestLaps] = useState<
    Record<Driver, Record<string, boolean>>
  >({
    "Max Verstappen": {},
    "Lando Norris": {},
  });
  const [champion, setChampion] = useState<Driver | null>(null);
  const [remainingPoints, setRemainingPoints] = useState(0);

  const handlePositionChange = (
    driver: Driver,
    race: string,
    position: string
  ) => {
    if (race === "Brazil Sprint") return; // Prevent changes to Brazil Sprint results
    setPositions((prev) => {
      const newPositions = { ...prev };
      if (newPositions[driver][race] === position) {
        delete newPositions[driver][race];
      } else {
        newPositions[driver] = { ...newPositions[driver], [race]: position };
      }
      return newPositions;
    });
  };

  const handleFastestLapChange = (
    driver: Driver,
    race: string,
    checked: boolean
  ) => {
    setFastestLaps((prev) => ({
      ...prev,
      [driver]: { ...prev[driver], [race]: checked },
    }));
  };

  useEffect(() => {
    const pointsSystem = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
    const sprintPointsSystem = [8, 7, 6, 5, 4, 3, 2, 1];

    const newResults: Record<Driver, number> = { ...initialPoints };
    let totalRemainingPoints = 0;

    races.forEach((race) => {
      if (race.isSprint) {
        totalRemainingPoints += 8;
      } else {
        totalRemainingPoints += 26;
      }
    });

    Object.entries(positions).forEach(([driver, driverPositions]) => {
      Object.entries(driverPositions).forEach(([race, position]) => {
        const pos = parseInt(position) - 1;
        if (pos >= 0) {
          const raceInfo = races.find((r) => r.name === race);
          if (raceInfo) {
            if (raceInfo.isSprint) {
              newResults[driver as Driver] += sprintPointsSystem[pos] || 0;
              totalRemainingPoints -= sprintPointsSystem[pos] || 0;
            } else {
              newResults[driver as Driver] += pointsSystem[pos] || 0;
              totalRemainingPoints -= pointsSystem[pos] || 0;
              if (fastestLaps[driver as Driver][race] && pos < 10) {
                newResults[driver as Driver] += 1;
                totalRemainingPoints -= 1;
              }
            }
          }
        }
      });
    });

    setResults(newResults);
    setRemainingPoints(totalRemainingPoints);
    const sortedDrivers = [...drivers].sort(
      (a, b) => newResults[b] - newResults[a]
    );
    const [leader, follower] = sortedDrivers;
    if (newResults[leader] > newResults[follower] + totalRemainingPoints) {
      setChampion(leader);
    } else {
      setChampion(null);
    }
  }, [positions, fastestLaps]);

  const calculatePointsNeeded = (driver: Driver) => {
    const otherDriver = drivers.find((d) => d !== driver) as Driver;
    const pointDifference = results[otherDriver] - results[driver];
    const remainingRaces = races.length - Object.keys(positions[driver]).length;

    if (remainingRaces === 0) return null;

    const pointsNeeded = Math.ceil(
      (pointDifference + remainingPoints) / remainingRaces
    );
    return pointsNeeded > 0 ? pointsNeeded : 0;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 space-y-6">
      {champion && (
        <Alert className="bg-yellow-900 border-yellow-600">
          <Trophy className="h-4 w-4 text-yellow-400" />
          <AlertTitle className="text-yellow-400">
            We have a champion!
          </AlertTitle>
          <AlertDescription className="text-yellow-200">
            {champion} has secured the World Drivers' Championship!
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4 text-center mb-6">
            {drivers.map((driver) => (
              <div key={driver} className="space-y-2">
                <div className="flex justify-center items-center">
                  <img
                    src={driverLogos[driver]}
                    alt={`${driver} logo`}
                    className="object-contain h-12 w-24"
                  />
                </div>
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                  {results[driver]} points
                </p>
                {calculatePointsNeeded(driver) !== null && (
                  <p className="text-sm text-gray-400">
                    {driver === "Lando Norris" ? "Lando" : "Max"} needs to
                    finish on average {calculatePointsNeeded(driver)} points
                    ahead of {driver === "Lando Norris" ? "Max" : "Lando"} to
                    win the WDC.
                  </p>
                )}
              </div>
            ))}
          </div>

          {races.map((race) => (
            <div key={race.name} className="mb-6 last:mb-0">
              <h2 className="text-xl font-semibold mb-2 text-purple-400 flex items-center">
                <span className="mr-2 text-2xl">{race.flag}</span> {race.name}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {drivers.map((driver) => (
                  <div key={`${driver}-${race.name}`} className="space-y-2">
                    <Label className="text-gray-300 flex items-center">
                      <img
                        src={driverLogos[driver]}
                        alt={`${driver} logo`}
                        className="object-contain h-6 w-12 mr-2"
                      />
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(
                        { length: race.isSprint ? 8 : 10 },
                        (_, i) => i + 1
                      ).map((pos) => (
                        <Button
                          key={pos}
                          variant={
                            positions[driver][race.name] === pos.toString()
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            handlePositionChange(
                              driver,
                              race.name,
                              pos.toString()
                            )
                          }
                          className={
                            positions[driver][race.name] === pos.toString()
                              ? "bg-purple-600 hover:bg-purple-700"
                              : "bg-gray-700 hover:bg-gray-600"
                          }
                          disabled={race.name === "Brazil Sprint"}
                        >
                          {pos}
                        </Button>
                      ))}
                    </div>
                    {!race.isSprint && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${driver}-${race.name}-fastest`}
                          checked={fastestLaps[driver][race.name] || false}
                          onCheckedChange={(checked) =>
                            handleFastestLapChange(
                              driver,
                              race.name,
                              checked as boolean
                            )
                          }
                          className="border-purple-400 text-purple-400"
                        />
                        <Label
                          htmlFor={`${driver}-${race.name}-fastest`}
                          className="text-gray-300"
                        >
                          Fastest Lap
                        </Label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
