(function () {

   document.getElementById('resetCalc').addEventListener('click', function() {
      $('#tasasEquivalentes').hide();
   });

   var TIPO_TASA = ['NOMINAL', 'EFECTIVA'];
   var PERIODOS = {
      mensual: {
         value: 12,
         descripcion: 'Mensual'
      },
      trimestral: {
         value: 4,
         descripcion: 'Trimestral'
      },
      semestral: {
         value: 2,
         descripcion: 'Semestral'
      },
      anual: {
         value: 1,
         descripcion: 'Anual'
      }
   };

   var interesRef = document.getElementById('interes');

   /** Valores Entrada */
   var tipoTasaRef = document.getElementById('tipoTasaEntrada');
   var periodicidadRef = document.getElementById('periodicidadEntrada');

   var formInputs = [interesRef, tipoTasaRef, periodicidadRef];

   function onSubmit() {
      var interes = parseInt(interesRef.value) / 100;
      var tipoTasa = TIPO_TASA[parseInt(tipoTasaRef.value)];
      var periodoEntrada = parseInt(periodicidadRef.value);
      var tasasEquivalentes = [];
      for (var key in PERIODOS) {
         var periodoSalida = PERIODOS[key];
         var valorNominal = getConvertidorNominal(tipoTasa, interes, periodoEntrada, periodoSalida.value).calcular();
         var valorEfectiva = getConvertidorEfectiva(tipoTasa, interes, periodoEntrada, periodoSalida.value).calcular();

         var tasaEquivalente = {
            periodo: periodoSalida.descripcion,
            nominalVencida: valorNominal * 100,
            efectivaVencida: valorEfectiva * 100
         };
         tasasEquivalentes.push(tasaEquivalente);
      }
      mostrarResultados(tasasEquivalentes);
   }

   function getConvertidorNominal(tipoTasa, interes, periodoEntrada, periodoSalida) {
      if (tipoTasa === TIPO_TASA[0]) {
         return new NominalANominal(interes, periodoEntrada, periodoSalida);
      }
      return new EfectivaANominal(interes, periodoEntrada, periodoSalida);
   }

   function getConvertidorEfectiva(tipoTasa, interes, periodoEntrada, periodoSalida) {
      if (tipoTasa === TIPO_TASA[0]) {
         return new NominalAEfectiva(interes, periodoEntrada, periodoSalida);
      }
      return new EfectivaAEfectiva(interes, periodoEntrada, periodoSalida);
   }

   function mostrarResultados(tasasEquivalentes) {
      var html = '';
      for (var index in tasasEquivalentes) {
         var tasa = tasasEquivalentes[index];
         html += `<tr>
                     <td>${tasa.periodo}</td>
                     <td>${parseFloat(tasa.efectivaVencida.toFixed(4))}%</td>
                     <td>${parseFloat(tasa.nominalVencida.toFixed(4))}%</td>
                  </tr>`;
      }
      document.getElementById('resultadoCalculos').innerHTML = html;
      $('#tasasEquivalentes').show();
   }


   /** Validación del formulario */
   $.validator.setDefaults({
      highlight: function (element, errorClass, validClass) {
         $(element).closest(".input-field").find("span.helper-text").show();
         if (element.tagName === 'SELECT'|| element.classList.contains('select-dropdown')) {
            $(element).closest('.select-wrapper').addClass('invalid');
         } else {
            $(element).removeClass(validClass).addClass(errorClass);
         }
      },
      unhighlight: function (element, errorClass, validClass) {
         $(element).closest(".input-field").find("span.helper-text").hide();
         if (element.tagName === 'SELECT' || element.classList.contains('select-dropdown')) {
            $(element).closest('.select-wrapper').removeClass('invalid');
         } else {
            $(element).removeClass(errorClass).addClass(validClass);
         }
      },
      errorClass: 'invalid',
      validClass: "",
      errorPlacement: function (error, element) {
            $(element)
               .closest(".input-field")
               .find("span.helper-text").text(error.text());
      },
      submitHandler: function (form) {
         onSubmit();
      }
   });

   $('#calcForm').validate({
      rules: {
         interes: "required",
         tipoTasaEntrada: "required",
         periodicidadEntrada: "required"
      },
      messages: {
         interes: "El campo es requerido",
         tipoTasaEntrada: "El campo es requerido",
         periodicidadEntrada: "El campo es requerido"
      }
   });
})();
