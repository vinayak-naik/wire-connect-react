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

export const SchoolStudentConnectPageClaude: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const schoolRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const studentRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [wire, setWire] = useState<WirePoints | null>(null);
  const [hoveredStudentId, setHoveredStudentId] = useState<number | null>(null);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastHoveredStudentRef = useRef<number | null>(null);
  const isScrollingRef = useRef<boolean>(false);

  const updateWire = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const schoolEl = schoolRefs.current[student.schoolId];
    const studentEl = studentRefs.current[studentId];
    const containerBox = containerRef.current?.getBoundingClientRect();

    if (!schoolEl || !studentEl || !containerBox) return;

    const sBox = schoolEl.getBoundingClientRect();
    const stBox = studentEl.getBoundingClientRect();

    // School center
    const x1 = sBox.left + sBox.width / 2 - containerBox.left + 55;
    const y1 = sBox.top + sBox.height / 2 - containerBox.top;

    // Student left-center
    const x2 = stBox.left - containerBox.left - 20;
    const y2 = stBox.top + stBox.height / 2 - containerBox.top - 20;

    // Inverse bend toward student
    const midX = x2 - 50;

    setWire({ x1, y1, x2, y2, midX });
  };

  // Update wire position during scroll, but don't change student
  useEffect(() => {
    const handleScroll = () => {
      // Update wire position immediately during scroll for current connection
      if (hoveredStudentId !== null) {
        updateWire(hoveredStudentId);
      }

      // Clear any existing timer
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }

      // Set a flag to indicate scrolling
      isScrollingRef.current = true;

      // Set a timer to clear the scrolling flag after 500ms
      scrollTimerRef.current = setTimeout(() => {
        isScrollingRef.current = false;

        // After scrolling completes, connect to the last hovered student if one exists
        if (lastHoveredStudentRef.current !== null) {
          setHoveredStudentId(lastHoveredStudentRef.current);
          updateWire(lastHoveredStudentRef.current);
        }
      }, 200);
    };

    const container = containerRef.current;
    container?.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      container?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll, true);

      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }

      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, [hoveredStudentId]);

  // Update wire when hoveredStudentId changes, but only after delay if not scrolling
  useEffect(() => {
    if (hoveredStudentId !== null) {
      if (!isScrollingRef.current) {
        // Keep updating position for current student
        updateWire(hoveredStudentId);
      }
    }
  }, [hoveredStudentId]);

  return (
    <div ref={containerRef} className="relative flex h-screen overflow-hidden p-5">
      {/* Wire SVG */}
      <svg className="pointer-events-none absolute z-10 h-full w-full">
        {wire && (
          <>
            <line x1={wire.x1} y1={wire.y1} x2={wire.midX} y2={wire.y1} stroke="#FFA901" strokeWidth={2} />
            <line x1={wire.midX} y1={wire.y1} x2={wire.midX} y2={wire.y2} stroke="#FFA901" strokeWidth={2} />
            <line x1={wire.midX} y1={wire.y2} x2={wire.x2} y2={wire.y2} stroke="#FFA901" strokeWidth={2} />

            {/* Thick dot at the start */}
            <circle cx={wire.x1} cy={wire.y1} r={4} fill="#FFA901" />

            {/* Thick dot at the end */}
            <circle cx={wire.x2} cy={wire.y2} r={4} fill="#FFA901" />
          </>
        )}
      </svg>

      {/* School Grid */}
      <div className="z-[1] grid w-3/5 grid-cols-3 gap-5">
        {schools.map(school => (
          <div
            key={school.id}
            ref={el => (schoolRefs.current[school.id] = el)}
            className="w-fit rounded-md border-2 border-[#0288d1] bg-[#e1f5fe] p-10 text-center font-bold"
          >
            {school.name}
          </div>
        ))}
      </div>

      {/* Student List */}
      <div className="z-[1] flex max-h-full w-2/5 flex-wrap gap-4 overflow-y-auto pl-5">
        {students.map(student => (
          <div
            key={student.id}
            ref={el => (studentRefs.current[student.id] = el)}
            onMouseEnter={() => {
              lastHoveredStudentRef.current = student.id;
              if (!isScrollingRef.current) {
                setHoveredStudentId(student.id);
                updateWire(student.id);
              }
            }}
            onMouseLeave={() => {
              // No-op: keeping lastHoveredStudentRef
            }}
            className="mb-4 w-2/5 cursor-pointer rounded border border-[#fb8c00] bg-[#ffe0b2] p-2.5"
          >
            {student.name}
          </div>
        ))}
      </div>
    </div>
  );
};
