'use strict';

const { createRecord, documentExists } = require('../src/db');

const demo = [
  {
    nombres: 'Valeria', apellidos: 'Mendoza Quispe', documento: '74851236',
    correo: 'valeria.mendoza@correo.edu.pe', telefono: '987654321',
    condicion: 'POSTULANTE', programa: 'Ingeniería de Sistemas', observaciones: 'Postulación registrada para demostración.'
  },
  {
    nombres: 'Diego', apellidos: 'Paredes Huamán', documento: '71245896',
    correo: 'diego.paredes@correo.edu.pe', telefono: '965412378',
    condicion: 'ESTUDIANTE', programa: 'Ingeniería Industrial', observaciones: 'Registro de demostración.'
  },
  {
    nombres: 'Lucía', apellidos: 'Rojas Ccopa', documento: '73541982',
    correo: 'lucia.rojas@correo.edu.pe', telefono: '954781236',
    condicion: 'POSTULANTE', programa: 'Ingeniería de Software', observaciones: ''
  }
];

let inserted = 0;
for (const item of demo) {
  if (!documentExists(item.documento)) {
    createRecord(item);
    inserted += 1;
  }
}
console.log(`Datos demo listos. Registros agregados: ${inserted}`);
