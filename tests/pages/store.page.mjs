export class StorePage {
  constructor(page) { this.page = page; }
  async open() { await this.page.goto('/'); await this.page.getByRole('button',{name:'Add Everyday Notebook',exact:true}).waitFor(); }
  async add(name) { await this.page.getByRole('button',{name:`Add ${name}`,exact:true}).click(); }
  async search(text) { await this.page.getByRole('searchbox',{name:'Search products',exact:true}).fill(text); }
  async applyCoupon(code) { await this.page.getByRole('textbox',{name:'Coupon code'}).fill(code); await this.page.getByRole('button',{name:'Apply coupon',exact:true}).click(); }
  async placeOrder(name = 'Demo Tester', email = 'qa@example.test') {
    await this.page.getByRole('textbox',{name:'Name',exact:true}).fill(name);
    await this.page.getByRole('textbox',{name:'Email',exact:true}).fill(email);
    await this.page.getByRole('button',{name:'Place demo order',exact:true}).click();
  }
}
