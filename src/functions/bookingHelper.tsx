// // script to check for available tours
//   const getCompiledSchedule = () => {
//     const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
//     const schedule: { [key: string]: { start: string; end: string; besas: string[] } } = {};

//     days.forEach(day => {
//       const availableBesas = besas.filter(besa =>
//         besa.officeHours[day as keyof typeof besa.officeHours].available
//       );

//       if (availableBesas.length > 0) {
//         const times = availableBesas.map(besa => ({
//           start: besa.officeHours[day as keyof typeof besa.officeHours].start,
//           end: besa.officeHours[day as keyof typeof besa.officeHours].end,
//           name: besa.name
//         }));

//         const earliestStart = times.reduce((earliest, current) =>
//           current.start < earliest ? current.start : earliest, times[0].start
//         );

//         const latestEnd = times.reduce((latest, current) =>
//           current.end > latest ? current.end : latest, times[0].end
//         );

//         schedule[day] = {
//           start: earliestStart,
//           end: latestEnd,
//           besas: availableBesas.map(besa => besa.name)
//         };
//       }
//     });

//     return schedule;
//   };