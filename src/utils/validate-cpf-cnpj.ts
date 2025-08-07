export class ValidateCPFAndCNPJ {
  static tamanhoCNPJWithoutDV = 12;
  static regexCNPJWithoutDV = /^([A-Z\d]){12}$/;
  static regexCNPJ = /^([A-Z\d]){12}(\d){2}$/;
  static regexTakeOutMask = /[./-]/g;
  static regexCaractersNotPermited = /[^A-Z\d./-]/i;
  static valorBase = "0".charCodeAt(0);
  static pesosDV = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  static cnpjZerado = "00000000000000";
  static cpfZerado = "00000000000";
  
  /**
   * Validate CPF
   * @param cpf - CPF to validate
   * @returns true if CPF is valid, false otherwise
   */
  static validateCPF(cpf: string): boolean {
    let Soma = 0;
    let Resto;

    const strCPF = this.removeDots(cpf);

    if (strCPF === this.cpfZerado) return false;

    for (let i = 1; i <= 9; i++) {
      Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    }

    Resto = (Soma * 10) % 11;

      if ((Resto == 10) || (Resto == 11))  Resto = 0;
      if (Resto != parseInt(strCPF.substring(9, 10)) ) return false;

    Soma = 0;
    for (let i = 1; i <= 10; i++) {
      Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
    }

    Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11)) Resto = 0;
    if (Resto != parseInt(strCPF.substring(10, 11) ) ) return false;

    return true;
  }

  /**
   * Validate CNPJ
   * @param cnpj - CNPJ to validate
   * @returns true if CNPJ is valid, false otherwise
   */
  static validateCNPJ(cnpj: string): boolean {
    if (!this.regexCaractersNotPermited.test(cnpj)) {
      let cnpjSemMascara = this.removeDots(cnpj);
      if (this.regexCNPJ.test(cnpjSemMascara) && cnpjSemMascara !== this.cnpjZerado) {
        const dvInformado = cnpjSemMascara.substring(this.tamanhoCNPJWithoutDV);
        const dvCalculado = this.calculateDV(cnpjSemMascara.substring(0, this.tamanhoCNPJWithoutDV));
        return dvInformado === dvCalculado;
      }
    }
    return false;
  }

  static calculateDV(cnpj: string): string {
    if (!this.regexCaractersNotPermited.test(cnpj)) {
      let cnpjSemMascara = this.removeDots(cnpj);
      if (this.regexCNPJWithoutDV.test(cnpjSemMascara) && cnpjSemMascara !== this.cnpjZerado.substring(0, this.tamanhoCNPJWithoutDV)) {
        let somatorioDV1 = 0;
        let somatorioDV2 = 0;
        for (let i = 0; i < this.tamanhoCNPJWithoutDV; i++) {
          const asciiDigito = cnpjSemMascara.charCodeAt(i) - this.valorBase;
          somatorioDV1 += asciiDigito * this.pesosDV[i + 1];
          somatorioDV2 += asciiDigito * this.pesosDV[i];
        }
        const dv1 = somatorioDV1 % 11 < 2 ? 0 : 11 - (somatorioDV1 % 11);
        somatorioDV2 += dv1 * this.pesosDV[this.tamanhoCNPJWithoutDV];
        const dv2 = somatorioDV2 % 11 < 2 ? 0 : 11 - (somatorioDV2 % 11);
        return `${dv1}${dv2}`;
      }
    }
    throw new Error("Not possible to calculate the DV because the provided CNPJ is invalid");
  }

  static removeDots(data: string): string {
      return data.replace(this.regexTakeOutMask, "");
  }
}
