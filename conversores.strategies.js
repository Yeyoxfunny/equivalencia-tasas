class EfectivaAEfectiva {

   constructor(interes, periodosEntrada, periodosSalida) {
      this.interes = interes;
      this.periodosEntrada = periodosEntrada;
      this.periodosSalida = periodosSalida;
   }

   calcular() {
      return Math.pow((1 + this.interes), this.periodosEntrada / this.periodosSalida) - 1;
   }
}

class EfectivaANominal {

   constructor(interes, periodosEntrada, periodosSalida) {
      this.interes = interes;
      this.periodosEntrada = periodosEntrada;
      this.periodosSalida = periodosSalida;
      this.efectivaAEfectiva = new EfectivaAEfectiva(interes, this.periodosEntrada, this.periodosSalida);
   }

   calcular() {
      var tasaEfectivaEquivalente = this.efectivaAEfectiva.calcular();
      return tasaEfectivaEquivalente * this.periodosSalida;
   }
}

class NominalAEfectiva {

   constructor(interes, periodosEntrada, periodosSalida) {
      this.interes = interes;
      this.periodosEntrada = periodosEntrada;
      this.periodosSalida = periodosSalida;
   }

   calcular() {
      var tasaEfectiva = this.interes / this.periodosEntrada;
      return new EfectivaAEfectiva(tasaEfectiva, this.periodosEntrada, this.periodosSalida).calcular();
   }
}

class NominalANominal {

   constructor(interes, periodosEntrada, periodosSalida) {
      this.interes = interes;
      this.periodosEntrada = periodosEntrada;
      this.periodosSalida = periodosSalida;
      this.nominalAEfectiva = new NominalAEfectiva(interes, periodosEntrada, periodosSalida);
   }

   calcular() {
      var tasaEfectiva = this.nominalAEfectiva.calcular();
      return tasaEfectiva * this.periodosSalida;
   }
}
