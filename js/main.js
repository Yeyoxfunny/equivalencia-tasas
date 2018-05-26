const app = angular.module('myApp', []);

const TIPO_TASA = ['NOMINAL', 'EFECTIVA'];
const PERIODO_SALIDA_MENSUAL = 12;

app.controller('mainController', function($scope) {
   $scope.incluirCuota = false;

   $scope.movimientos = [];

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
      valor: 1000000,
      tiempo: 12,
      afecta: 'TIEMPO'
   };
   
   function agregarMovimiento(afecta, descripcion) {
      const movimiento = {
         capital: $scope.capital,
         cuota: $scope.valorCuota,
         tiempo: $scope.tiempo,
         afecta: afecta,
         descripcion: descripcion
      };
      $scope.movimientos.push(movimiento);
   }

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
      $scope.tasaEquivalente = redondear(tasaEquivalente, 3);
      console.log('Tasa Equivalente: ' + $scope.tasaEquivalente);

      $scope.valorCuota = calcularCuota();
      console.log('Valor de la cuota: ' + $scope.valorCuota);

      agregarMovimiento();
   }

   function calcularCuota() {
      const pow = Math.pow((1 + $scope.tasaEquivalente), -$scope.tiempo);
      const cuota = $scope.capital / ((1 - pow) / $scope.tasaEquivalente);

      /** Mostrar datos en campo de salida, esta es la cuota inicial */
      return redondear(cuota, 3);
   }

   $scope.toggleCuota = function() {
      let valor;
      if ($scope.incluirCuota) {
         valor = $scope.pagoExtraordinario.valor + $scope.valorCuota;
      } else {
         valor = $scope.pagoExtraordinario.valor - $scope.valorCuota;
      }
      $scope.pagoExtraordinario.valor = valor;
   }

   $scope.realizarPagoExtraordinario = function() {
      console.log($scope.pagoExtraordinario);
      const plazosFaltantes = $scope.tiempo - ($scope.pagoExtraordinario.tiempo - 1);
      console.log('Plazos Faltantes: ' + plazosFaltantes);
      
      const pow = Math.pow((1 + $scope.tasaEquivalente), -plazosFaltantes);

      /** Deuda al momento de realizar el primer pago extraordinario. */
      const valorPresenteDeuda = $scope.valorCuota * ((1 - pow) / $scope.tasaEquivalente);

      console.log(valorPresenteDeuda);

      /** Calcula intereses entre plazo anterior (11) y 
       * el plazo en el que se realiza el pago extraordianrio(12) */
      const interesesPorPagar = valorPresenteDeuda * $scope.tasaEquivalente;
      console.log('Intereses por pagar: ' + interesesPorPagar);

      /** Diferencia entre el pago extraordinario realizado menos los intereses por pagar. */
      const valorExtraordinarioNeto = $scope.pagoExtraordinario.valor - interesesPorPagar;

      /** Valor Actual de la Deuda. */
      const valorPresenteActual = valorPresenteDeuda - valorExtraordinarioNeto;
      $scope.capital = redondear(valorPresenteActual, 3);
      
      console.log(valorPresenteActual);

      if ($scope.pagoExtraordinario.afecta === 'TIEMPO') {
         console.log('------ Afecta Tiempo -------------');
         const periodosFaltantes = reduccionTiempo(valorPresenteActual);
         console.log('Periodos Faltantes: ' + periodosFaltantes);
         /** Actualizar Tiempo */
         $scope.tiempo = redondear(periodosFaltantes + $scope.pagoExtraordinario.tiempo, 2);
      } else {
         console.log('------ Afecta Valor Cuota -------------');
         $scope.valorCuota = redondear(reduccionCuota(valorPresenteActual), 3);
      }

      const descripcion = 'Pago extraordinario en el periodo ' + $scope.pagoExtraordinario.tiempo;
      agregarMovimiento($scope.pagoExtraordinario.afecta, descripcion);
      $scope.pagoExtraordinario = undefined;
      $scope.incluirCuota = false;
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

   function redondear(valor, decimales) {
      return parseFloat(valor.toFixed(20).slice(0, decimales - 20));
   }
});

app.filter('redondear', function() {
   return function(valor, digitos) {
      return valor.toFixed(digitos);
   }
})