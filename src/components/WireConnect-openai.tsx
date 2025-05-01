import React, { useEffect, useRef, useState } from 'react';

interface School {
  id: number;
  name: string;
}
interface Student {
  id: number;
  name: string;
  schoolId: number;
}

const schools: School[] = [
  { id: 1, name: 'School A' },
  { id: 2, name: 'School B' },
  { id: 3, name: 'School C' },
  { id: 4, name: 'School D' },
  { id: 5, name: 'School E' },
  { id: 6, name: 'School F' },
];

const students: Student[] = Array.from({ length: 30 }, (_, i) => ({
  id: 100 + i,
  name: `Student ${i + 1}`,
  schoolId: schools[i % schools.length].id,
}));

interface WirePoints {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  midX: number;
}

export const SchoolStudentConnectPageOpenai: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const schoolRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const studentRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [wire, setWire] = useState<WirePoints | null>(null);
  const [hoveredStudentId, setHoveredStudentId] = useState<number | null>(null);

  const updateWire = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const schoolEl = schoolRefs.current[student.schoolId];
    const studentEl = studentRefs.current[studentId];
    const containerBox = containerRef.current?.getBoundingClientRect();

    if (!schoolEl || !studentEl || !containerBox) return;

    const sBox = schoolEl.getBoundingClientRect();
    const stBox = studentEl.getBoundingClientRect();

    const x1 = sBox.left + sBox.width / 2 - containerBox.left;
    const y1 = sBox.top + sBox.height / 2 - containerBox.top;

    const x2 = stBox.left - containerBox.left;
    const y2 = stBox.top + stBox.height / 2 - containerBox.top;

    const midX = x1 + 50;

    setWire({ x1, y1, x2, y2, midX });
  };

  // Update wire on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (hoveredStudentId !== null) {
        updateWire(hoveredStudentId);
      }
    };

    const container = containerRef.current;
    container?.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      container?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [hoveredStudentId]);

  return (
    <div ref={containerRef} style={{ position: 'relative', height: '100vh', display: 'flex', padding: '20px', overflow: 'hidden' }}>
      {/* Wire SVG */}
      <svg style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }}>
        {wire && (
          <>
            <line x1={wire.x1} y1={wire.y1} x2={wire.midX} y2={wire.y1} stroke="black" strokeWidth={2} />
            <line x1={wire.midX} y1={wire.y1} x2={wire.midX} y2={wire.y2} stroke="black" strokeWidth={2} />
            <line x1={wire.midX} y1={wire.y2} x2={wire.x2} y2={wire.y2} stroke="black" strokeWidth={2} />
          </>
        )}
      </svg>

      {/* School Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 150px)',
          gap: '20px',
          width: '60%',
          zIndex: 1,
        }}
      >
        {schools.map(school => (
          <div
            key={school.id}
            ref={el => (schoolRefs.current[school.id] = el)}
            style={{
              padding: '20px',
              backgroundColor: '#e1f5fe',
              border: '2px solid #0288d1',
              borderRadius: '8px',
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            {school.name}
          </div>
        ))}
      </div>

      {/* Student List */}
      <div
        style={{
          width: '40%',
          maxHeight: '100%',
          overflowY: 'auto',
          paddingLeft: '20px',
          zIndex: 1,
        }}
      >
        {students.map(student => (
          <div
            key={student.id}
            ref={el => (studentRefs.current[student.id] = el)}
            onMouseEnter={() => {
              setHoveredStudentId(student.id);
              updateWire(student.id);
            }}
            style={{
              padding: '10px',
              marginBottom: '15px',
              backgroundColor: '#ffe0b2',
              border: '1px solid #fb8c00',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            {student.name}
          </div>
        ))}
      </div>
    </div>
  );
};
