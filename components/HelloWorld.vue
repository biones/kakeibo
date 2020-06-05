<template>
  <div class="hello">
    <v-spacer></v-spacer>
    <br /><br />
    <v-form ref="form" v-model="valid" lazy-validation style="width: 300px;">
      <h3>入力日</h3>
      <Datepicker label="Select a date" v-model="form.date"></Datepicker>
      <v-radio-group v-model="form.type_input" row>
        <v-radio label="収入" 　value="in"></v-radio>
        <v-radio label="支出" 　value="out"></v-radio>
      </v-radio-group>
      <v-select
        v-model="form.type"
        :items="items"
        label="type"
        required
      ></v-select>

      <v-text-field
        type="number"
        v-model.number="form.amount"
        :counter="10"
        label="金額"
        required
      ></v-text-field>
      <h3></h3>
      <Datepicker placeholder="期限" v-model="form.due"></Datepicker>

      <v-text-field
        v-model.number="form.torihikisaki"
        :counter="10"
        label="取引先"
        required
      ></v-text-field>
      <v-text-field
        v-model="form.detail"
        :counter="10"
        label="detail"
      ></v-text-field>

      <!--    
    <v-checkbox
      v-model="checkbox"
      :rules="[v => !!v || 'You must agree to continue!']"
      label="Do you agree?"
      required
    ></v-checkbox>
    -->
      <v-btn :disabled="!valid" @click="submit">submit</v-btn>
      <v-btn @click="clear">clear</v-btn>
    </v-form>
    <br />
    <div v-model=shukei>
      zankin:{{ shukei.zankin }}<br /><br /><br />
      <h3>recent 1month</h3>
      total:{{ shukei.total }}<br />
      食費:{{ shukei.shokuhi }}<br />
      日用品:{{ shukei.nitiyohin }}<br />
      交通費:{{ shukei.kotuhi }}<br />
      固定費:{{ shukei.koteihi }}<br />
    </div>
    <br /><br />
    <v-spacer></v-spacer>

    <!--
    <datatable v-bind:colname="tableid" />
    -->
    <v-data-table
      :headers="headers"
      :items="datas"
      sort-by="date"
      class="elevation-1"
      :items-per-page="30"
    >
      <template v-slot:top>
        <v-toolbar flat color="white">
          <v-toolbar-title>My CRUD</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on }">
              <!--
              <v-btn color="primary" dark class="mb-2" v-on="on"
                >New Item</v-btn
              >-->
            </template>
            <v-card>
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>

              <!--  editeeditem-->
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field
                        v-model="editedItem.date"
                        label="date"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field
                        v-model="editedItem.amount"
                        label="amount"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field
                        v-model="editedItem.type"
                        label="type"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field
                        v-model="editedItem.detail"
                        label="detail"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                      <v-text-field
                        v-model="editedItem.due"
                        label="due"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="save">Save</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-icon small class="mr-2" @click="editItem(item)">
          mdi-pencil
        </v-icon>
        <v-icon small @click="deleteItem(item)">
          mdi-delete
        </v-icon>
      </template>
      <!--
      <template v-slot:no-data>
        <v-btn color="primary" @click="">Reset</v-btn>
      </template>
      -->
    </v-data-table>

    <v-select
      :items="tablenames"

      outlined
      :value="tablename"
      @change="changetable"
      style="width: 200px;"
    ></v-select>

    <v-btn small color="error" @click="CreateTable">テーブルを作る</v-btn>
    <v-btn small color="error" @click="removeTable">テーブルを削除</v-btn>
  </div>
</template>

<script>
import firebase from "firebase";
import Datepicker from "vuejs-datepicker";
import datatable from "./Datatable";

function getdate() {
  var today = new Date();
  today.setDate(today.getDate());
  var yyyy = today.getFullYear();
  var mm = ("0" + (today.getMonth() + 1)).slice(-2);
  var dd = ("0" + today.getDate()).slice(-2);
  return yyyy + "-" + mm + "-" + dd;
}

const generateUuid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
    .replace(/x/g, () => Math.floor(Math.random() * 16).toString(16))
    .replace(/y/g, () => (Math.floor(Math.random() * 4) + 8).toString(16));
};

function sum(obj) {
  return Object.keys(obj).reduce(
    (sum, key) => sum + parseFloat(obj[key] || 0),
    0
  );
}

function suma(ary) {
  let tmp = ary.reduce((a, b) => {
    return a + b;
  }, 0);
  return tmp;
}

function group_by(data, col) {
  let res = {};
  console.log(data);
  data.forEach((d) => {
    console.log(d.type);
    try {
      res[d.type].push(d.amount);
    } catch {
      res[d.type] = [d.amount];
    }
  });
  return res;
}

export default {
  components: {
    Datepicker,
    datatable,
  },

  data: () => ({
    valid: true,
    tables: [],
    tablenames:[],
    tableid: null,
    tablename: null,
    
    form: {
      type_input: "out",
      detail: "",
      type: null,
      amount: null,
      due: null,
      date: null,
      torihikisaki: null,
    },

    items: ["食費", "交通費", "日用品", "娯楽費", "その他", "固定費"],
    total: null,
    shukei: {},
    menu: false,
    modal: false,

    dialog: false,
    datas: [],
    headers: [],
    editedIndex: -1,
    editedItem: {
      name: "",
      calories: 0,
      fat: 0,
      carbs: 0,
      protein: 0,
    },
    defaultItem: {
      name: "",
      calories: 0,
      fat: 0,
      carbs: 0,
      protein: 0,
    },
    nameRules: [
      (v) => !!v || "Name is required",
      (v) => (v && v.length <= 10) || "Name must be less than 10 characters",
    ],

    checkbox: false,
  }),

  created: async function() {
    this.db = firebase.firestore(); // dbインスタンスを初期化    
    firebase.auth().onAuthStateChanged(async (luser) => {
      this.uid = luser.uid;
      this.init_form();
      await this.initdatatable();      
      this.init_shukei()
            
    });
  },

  methods: {
    init_form() {
      this.form.date = getdate();
      this.now = this.form.date;
      this.form.due = this.form.date;
      this.form.type = this.items[0];
      this.form.type_input = "out";
      this.form.detail=null
      this.form.amount=null
    },

    init_shukei(){
      let komoku =this.items 

      this.translate = {
        食費: "shokuhi",
        日用品: "nitiyohin",
        その他: "other",
        交通費: "kotuhi",
        固定費: "koteihi",
        娯楽費:"gorakuhi"
      };

      let res = {};
      komoku.forEach((k) => {
        res[k] = 0;
      });

      let adatas = this.datas.filter((x) => x.type_input == "out");
      let df = group_by(adatas, "type");
      console.log(adatas);

      let sdf = Object.keys(df).map((key) => {
        console.log(key);
        res[key] = sum(df[key]);
      });
      console.log(sdf);
      console.log(res);
      //this.shukei.zakka=0
      //this.shukei.shokuhi=0
      //this.shukei.kotuhi=0
      this.shukei.total = sum(res);
      this.shukei.zakka = res["雑貨"];
      this.shukei.shokuhi = res["食費"];
      this.shukei.kotuhi = res["交通費"];
      this.shukei.koteihi = res["固定費"];
      
      console.log(this.shukei);

      let tableref = this.db.collection("accounts").doc(this.tableid);

      //.where("date",">=",dt)
      tableref.get().then((d) => {
        console.log(d.data());
        this.tablename = d.data().tablename;
        this.shukei.zankin = d.data().total;
        this.shukei=Object.assign({},this.shukei)
      });

      
    },

    async initdatatable() {
      this.datas = [];
      this.headers = [];
      let uid = this.uid;
      let dt = new Date();
      dt.setMonth(dt.getMonth() - 1);

      let udoc = await this.db
        .collection("users")
        .doc(uid)
        .get();

      this.tables = udoc.data().editable_tables;
      this.tablenames=this.tables.map(x=>x.name)
      this.tablesdic={}
      this.tables.map(x=>this.tablesdic[x.name]=x.id)
      console.log(this.tablenames)
      //if(!this.tables)this.tables=[]

      if (this.tables.length == 0) return;
      console.log(this.tables)
      if(this.tableid==null){
        let tableid = this.tables[0].id
        this.tableid = tableid;
        this.tablename=this.tables[0].name
      }

      console.log(this.tablename,this.tableid);
      let tableref = this.db.collection("accounts").doc(this.tableid);
      this.tableref = tableref

      let tmp = await tableref
        .collection("accounttable")
        //.where("type_input","==","out")
        .orderBy("date", "asc")
        .get();
      //tmp=tmp.filter(x=>x.type_input=="out")
      tmp.forEach((x) => {
        let dd = x.data();
        dd.docid = x.id;
        this.datas.push(dd);
      });
      //this.datas=tmp.docs
      //this.datas[0].forEach(x=>this.headers.push({text:x,value:x}))

      //init header
      let header = {};
      Object.assign(header, this.datas[0]);
      //let header=this.datas[0]
      delete header.docid;

      Object.keys(header).forEach((x) => {
        console.log(x);
        if (x != "created_at") {
          this.headers.push({ text: x, value: x });
        }
      });
      this.headers.push({ text: "Actions", value: "actions", sortable: false });
      console.log(header);     

      this.db.collection("accounts").doc(this.tableid).onSnapshot(()=>{this.init_shukei()})
           
    },
    submit() {
      if (this.$refs.form.validate()) {

        let col = this.db
          .collection("accounts")
          .doc(this.tableid)
          .collection("accounttable");
        //data=this.data
        //data={}
        // type,type2,金額,detail
        //・type1,type2から決まる税区分など
        //accounts/tableid/
        this.form.created_at = firebase.firestore.FieldValue.serverTimestamp();
        if(this.form.type_input=="in")this.form.type=null

        let copyObj = {};
        Object.assign(copyObj, this.form);
        this.datas.push(copyObj);
        col.add(this.form);

        /*
        let sign = -1;
        if (this.form.type_input == "in") {
          sign = 1;
          this.form.type = null;
        } else {
          this.shukei[this.translate[this.form.type]] += this.form.amount;
          this.shukei.total += this.form.amount;
        }
        this.shukei.zankin = this.shukei.zankin + sign * this.form.amount;
        */
        
        /*
        axios.post("/api/submit", {
          name: this.name,
          email: this.email,
          select: this.select,
          checkbox: this.checkbox
        });
        */
        if (this.headers.length < 3) this.initdatatable();
        this.init_shukei()
        this.init_form()
      }
    },
    clear() {
      //this.$refs.form.reset();
      Object.keys(this.form).forEach((fm) => {
        this.form[fm] = null;
      });
      this.form.type = this.items[0];
      this.form.type_input = "out";
    },

    editItem(item) {
      this.editedIndex = this.datas.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      const index = this.datas.indexOf(item);
      console.log(this.datas[index]);
      const id = this.datas[index].docid;

      if(confirm("Are you sure you want to delete this item?")){
        this.datas.splice(index, 1);

        this.db
        .collection("accounts")
        .doc(this.tablesid)
        .collection("accounttable")
        .doc(id)
        .delete();

        //this.fix_shukei(item);
        this.init_shukei()
        
      }
    },
    fix_shukei(item) {
      console.log(item);
      console.log(this.tables);
      let flg = item.type_input == "in" ? 1 : -1;

      this.db
        .collection("accounts")
        .doc(this.tableid)
        .update({
          total: firebase.firestore.FieldValue.increment(flg * item.amount),
        });
      //this.shukei.total+=flg*item.amount
      //this.shukei.zankin+=flg*item.amount
    },
    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },

    save() {
      if (this.editedIndex > -1) {
        Object.assign(this.datas[this.editedIndex], this.editedItem);

        console.log(this.editedItem);
        console.log(this.tables)
        this.db
          .collection("accounts")
          .doc(this.tableid)
          .collection("accounttable")
          .doc(this.editedItem.docid)
          .update(this.editedItem);

        //this.fix_shukei(this.editedItem);
        this.close();
        this.init_shukei();
      } else {
        this.datas.push(this.editedItem);
        console.log(this.datas);
        this.close();
      }
    },
    changetable() {
      console.log(this.tablesdic)
      this.tableid=this.tablesdic[this.tablename]
      this.initdatatable()
      this.init_shukei()
    },
    CreateTable() {
      let tname = window.prompt("テーブル名", "");

      if (tname.length > 0) {
        //let uuid = generateUuid();
        let docref = this.db.collection("accounts").doc();
        console.log(tname);
        console.log(docref);
        //docref.collection("")
        const tablesref = this.tables;
        firebase.auth().onAuthStateChanged((luser) => {
          console.log(luser);
          docref.set({ editor: [luser.uid], tablename: tname, total: 0 });
          //docref.collection(uuid);
          console.log(docref);
          console.log(this.tables);
          console.log(this);
          tablesref.push(docref.id);
          this.tableid = docref.id;
          let table={id:docref.id,name:tname}
          this.db
            .collection("users")
            .doc(luser.uid)
            .update({
              editable_tables: firebase.firestore.FieldValue.arrayUnion(
                table
              ),
            });
          this.tableid = docref.id;
          this.tablename = tname;
          this.initdatatable(this.uid);
          //location.reload()
        });
      }
    },
    async removeTable() {
      if (this.tablename == "default") return 0;
      if (confirm("テーブルを削除しますか?")) {
        console.log(this.tables);
        this.db
          .collection("accounts")
          .doc(this.tableid)
          .delete();
        let d = await this.db
          .collection("users")
          .doc(this.uid)
          .get();

        console.log(d.data());
        let et = d.data().editable_tables;
        et = et.filter((x) => x.id != this.tableid);
        console.log(et);
        this.db
          .collection("users")
          .doc(this.uid)
          .update({ editable_tables: et });
        
        this.tablename="default"
        this.changetable()
      }
    },
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "New Item" : "Edit Item";
    },
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
  },
};
</script>
