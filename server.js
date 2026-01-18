const express = require("express");
const cors = require("cors");
const app = express();
const models = require("./models");
const { or } = require("sequelize");
const port = 8080;
const multer = require("multer");
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

app.get("/banners", (req, res) => {
  models.banner
    .findAll({
      limit: 2,
    })
    .then((result) => {
      res.send({
        banners: result,
      });
    })
    .catch((error) => {
      res.status(500).send("에러가 발생함");
    });
});

app.get("/products", (req, res) => {
  models.product
    .findAll({
      //order: [["createdAt", "DESC"]],
      attributes: [
        "id",
        "name",
        "price",
        "createdAt",
        "seller",
        "imageUrl",
        "soldout",
      ],
    })
    .then((result) => {
      console.log("PRODUCTS! : ", result);
      res.send({
        products: result,
      });
    })
    .catch((error) => {
      console.error(error);
      res.send("오류 발생!!");
    });
});

app.post("/products", (req, res) => {
  const body = req.body;
  const { name, description, price, seller, imageUrl } = body;
  if (!name || !description || !price || !seller || !imageUrl) {
    res.status(400).send("모든 필드를 다 입력해주세요");
  }
  models.product
    .create({
      name,
      description,
      price,
      seller,
      imageUrl: body.imageUrl,
    })
    .then((result) => {
      console.log("상품생성결과 :", result);
      res.send(result);
    })
    .catch((error) => {
      console.log(error);
      res.send("상품 업로드에 문제가 발생함");
    });
  //res.send({
  //body,
  //});
});

app.get("/products/:id", (req, res) => {
  const params = req.params;
  const { id } = params;
  models.product
    .findOne({
      where: {
        id: id,
      },
    })
    .then((result) => {
      console.log("PRODUCT :", result);
      res.send({
        product: result,
      });
    })
    .catch((error) => {
      console.error(error);
      res.send("상품 조회에 오류 발생");
    });
});

// app.listen(port, () => {
//   console.log("그랩의 쇼핑몰 서버가 돌아가고 있습니다.");
// });
app.post("/image", upload.single("image"), (req, res) => {
  const file = req.file;
  console.log(file);
  res.send({
    imageUrl: file.path,
  });
});

app.post("/purchase/:id", (req, res) => {
  const { id } = req.params;
  models.product
    .update(
      {
        soldout: 1,
      },
      {
        where: {
          id: id,
        },
      }
    )
    .then((result) => {
      res.send({
        result: true,
      });
    })
    .catch((error) => {
      res.status(500).send("에러가발생함");
    });
});
app.listen(port, () => {
  console.log("그랩 마켓의 서버가 돌아가고 있습니다.");
  models.sequelize
    .sync()
    .then(() => {
      console.log("✓ DB 연결 성공");
    })
    .catch(function (err) {
      console.error(err);
      console.log("✗ DB 연결 에러");
      process.exit();
    });
});
