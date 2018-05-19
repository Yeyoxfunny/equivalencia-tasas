const app = angular.module('myApp', []);
const TIPO_TASA = ['NOMINAL', 'EFECTIVA'];
const PERIODO_SALIDA_MENSUAL = 12;

app.controller('mainController', function($scope) {
   
   /** Datos de Entrada */
   $scope.interesEntrada = 18;
   $scope.tipoTasaEntrada = 0;
   $scope.periodicidadEntrada = 4;
   $scope.capital = 10000000;
   /** Tiempo base */
   $scope.tiempo = 48;


   /** Datos de salida */
   $scope.tasaEquivalente = 0;
   $scope.valorCuota = 0;

   /** Pagos extraordinarios, datos de entrada */
   $scope.pagoExtraordinario = {
      valor: 1292497.3782,
      tiempo: 12,
      afecta: 'TIEMPO'
   };
   

   $scope.calcular = function() {
      const tipoTasaIndex = parseInt($scope.tipoTasaEntrada);
      const interesEntrada = parseFloat($scope.interesEntrada) / 100;
      const periodoEntrada = parseInt($scope.periodicidadEntrada);

      let tasaEquivalente = 0;

      if (TIPO_TASA[tipoTasaIndex] === TIPO_TASA[0]) {
         tasaEquivalente = 
         new NominalAEfectiva(interesEntrada, periodoEntrada, PERIODO_SALIDA_MENSUAL)
         .calcular();
      } else {
         tasaEquivalente = new EfectivaAEfectiva(interesEntrada, periodoEntrada, PERIODO_SALIDA_MENSUAL)
         .calcular();
      }
      $scope.tasaEquivalente = parseFloat(tasaEquivalente.toFixed(4));
      $scope.valorCuota = calcularCuota();
      console.log($scope.valorCuota);

   }
   

   function calcularCuota() {
      console.log('Tasa Equivalente: ' + $scope.tasaEquivalente);
      const pow = Math.pow((1 + $scope.tasaEquivalente), -$scope.tiempo);
      console.log('Potencia: ' + pow);
      const cuota = $scope.capital / ((1 - pow) / $scope.tasaEquivalente);

      /** Mostrar datos en campo de salida, esta es la cuota inicial */
      return parseFloat(cuota.toFixed(4));
   }


   $scope.realizarPagoExtraordinario = function() {
      console.log($scope.pagoExtraordinario);
      const plazosFaltantes = $scope.tiempo - ($scope.pagoExtraordinario.tiempo - 1);
      console.log(plazosFaltantes);
      
      const pow = Math.pow((1 + $scope.tasaEquivalente), -plazosFaltantes);

      /** Deuda al momento de realizar el primer pago extraordinario. */
      const valorPresenteDeuda = $scope.valorCuota * ((1 - pow) / $scope.tasaEquivalente);

      console.log(valorPresenteDeuda);

      /** Calcula intereses entre plazo anterior (11) y 
       * el plazo en el que se realiza el pago extraordianrio(12) */
      const interesesPorPagar = valorPresenteDeuda * $scope.tasaEquivalente;

      /** Diferencia entre el pago extraordinario realizado menos los intereses por pagar. */
      const valorExtraordinarioNeto = $scope.pagoExtraordinario.valor - interesesPorPagar;

      /** Valor Actual de la Deuda. */
      const valorPresenteActual = valorPresenteDeuda - valorExtraordinarioNeto;
      $scope.capital = valorPresenteActual;
      
      console.log(valorPresenteActual);

      if ($scope.pagoExtraordinario.afecta === 'TIEMPO') {
         console.log('------ Afecta Tiempo -------------');
         const periodosFaltantes = reduccionTiempo(valorPresenteActual);

         /** Actualizar Tiempo */
         $scope.tiempo = periodosFaltantes + $scope.pagoExtraordinario.tiempo;
      } else {
         console.log('------ Afecta Valor Cuota -------------');
         $scope.valorCuota = reduccionCuota(valorPresenteActual);
      }
      
   }

   function reduccionTiempo(valorPresenteActual) {
      let reduccion = ((valorPresenteActual / $scope.valorCuota) * $scope.tasaEquivalente) - 1;
      reduccion = reduccion * -1;

      console.log('Reduccion: ' + reduccion);
      const parteIzquierda = Math.log(reduccion) * -1;
      const parteDerecha = Math.log(1 + $scope.tasaEquivalente);
      console.log('Parte izquierda ' + parteIzquierda);
      console.log('Parte derecha: ' + parteDerecha);

      const periodosFaltantes = parteIzquierda / parteDerecha;
      return periodosFaltantes;
   }


   function reduccionCuota(valorPresenteActual) {
      /** Tiempo entre pago extraordinario y el tiempo de finalizacion de la deuda. */
      const tiempo = $scope.tiempo - $scope.pagoExtraordinario.tiempo;

      const pow = Math.pow((1 + $scope.tasaEquivalente), -tiempo);
      const nuevaCuota = valorPresenteActual / ((1 - pow) / $scope.tasaEquivalente);
      return nuevaCuota;
   }
});