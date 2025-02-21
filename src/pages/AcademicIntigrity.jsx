import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

const AcademicIntegrity = () => {
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState([
    { name: "John Doe", reason: "Copied from another student", proof: "proof1.jpg" },
    { name: "Jane Smith", reason: "Used mobile phone", proof: "proof2.jpg" },
  ]);
  
  const filteredRecords = records.filter((record) =>
    record.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Academic Integrity & Cheating Record</h1>
      
      <Input
        type="text"
        placeholder="Search student..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />
      
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Proof</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record, index) => (
                <TableRow key={index}>
                  <TableCell>{record.name}</TableCell>
                  <TableCell>{record.reason}</TableCell>
                  <TableCell>
                    <a href={`/proofs/${record.proof}`} target="_blank" className="text-blue-500 underline">
                      View Proof
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcademicIntegrity;

