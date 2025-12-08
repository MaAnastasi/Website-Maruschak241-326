const dishes = [
  // Супы (6 штук: 2 рыбных, 2 мясных, 2 вегетарианских)
  {
    keyword: 'fish_soup',
    name: 'Уха из трех рыб',
    price: 320,
    category: 'soup',
    kind: 'fish',
    count: '350г',
    image: 'images/soup4.jpg'
  },
  {
    keyword: 'salmon_chowder',
    name: 'Крем-суп из лосося',
    price: 350,
    category: 'soup',
    kind: 'fish',
    count: '300г',
    image: 'images/soup6.jpg'
  },
  {
    keyword: 'beef_soup',
    name: 'Борщ с говядиной',
    price: 280,
    category: 'soup',
    kind: 'meat',
    count: '400г',
    image: 'images/soup2.jpg'
  },
  {
    keyword: 'chicken_noodle',
    name: 'Куриный суп с лапшой',
    price: 250,
    category: 'soup',
    kind: 'meat',
    count: '350г',
    image: 'images/soup1.jpg'
  },
  {
    keyword: 'mushroom_cream',
    name: 'Грибной крем-суп',
    price: 270,
    category: 'soup',
    kind: 'veg',
    count: '350г',
    image: 'images/soup5.jpg'
  },
  {
    keyword: 'tomato_basil',
    name: 'Томатный суп с базиликом',
    price: 260,
    category: 'soup',
    kind: 'veg',
    count: '350г',
    image: 'images/soup3.jpg'
  },
  
  // Главные блюда (6 штук: 2 рыбных, 2 мясных, 2 вегетарианских)
  {
    keyword: 'salmon_steak',
    name: 'Стейк из лосося с овощами',
    price: 450,
    category: 'main',
    kind: 'fish',
    count: '350г',
    image: 'images/main3.jpg'
  },
  {
    keyword: 'trout_with_rice',
    name: 'Форель с рисом и соусом',
    price: 420,
    category: 'main',
    kind: 'fish',
    count: '400г',
    image: 'images/main4.jpg'
  },
  {
    keyword: 'beef_stroganoff',
    name: 'Бефстроганов с картофелем',
    price: 380,
    category: 'main',
    kind: 'meat',
    count: '350г',
    image: 'images/main6.jpg'
  },
  {
    keyword: 'chicken_cutlets',
    name: 'Куриные котлеты с пюре',
    price: 350,
    category: 'main',
    kind: 'meat',
    count: '400г',
    image: 'images/main2.jpg'
  },
  {
    keyword: 'vegetable_curry',
    name: 'Овощное карри с киноа',
    price: 320,
    category: 'main',
    kind: 'veg',
    count: '350г',
    image: 'images/main5.jpg'
  },
  {
    keyword: 'mushroom_pasta',
    name: 'Паста с грибами и трюфелем',
    price: 340,
    category: 'main',
    kind: 'veg',
    count: '300г',
    image: 'images/main1.jpg'
  },
  
  // Салаты и стартеры (6 штук: 1 рыбный, 1 мясной, 4 вегетарианских)
  {
    keyword: 'herring_salad',
    name: 'Салат с сельдью и картофелем',
    price: 280,
    category: 'salad',
    kind: 'fish',
    count: '250г',
    image: 'images/salad4.jpg'
  },
  {
    keyword: 'caesar_salad',
    name: 'Цезарь с курицей',
    price: 320,
    category: 'salad',
    kind: 'meat',
    count: '300г',
    image: 'images/salad5.jpg'
  },
  {
    keyword: 'greek_salad',
    name: 'Греческий салат',
    price: 260,
    category: 'salad',
    kind: 'veg',
    count: '300г',
    image: 'images/salad1.jpg'
  },
  {
    keyword: 'caprese_salad',
    name: 'Капрезе с моцареллой',
    price: 290,
    category: 'salad',
    kind: 'veg',
    count: '250г',
    image: 'images/salad2.jpg'
  },
  {
    keyword: 'vegetable_mix',
    name: 'Овощной микс с авокадо',
    price: 240,
    category: 'salad',
    kind: 'veg',
    count: '300г',
    image: 'images/salad3.jpg'
  },
  {
    keyword: 'beetroot_salad',
    name: 'Салат со свеклой и орехами',
    price: 220,
    category: 'salad',
    kind: 'veg',
    count: '250г',
    image: 'images/salad6.jpg'
  },
  
  // Напитки (6 штук: 3 холодных, 3 горячих)
  {
    keyword: 'orange_juice',
    name: 'Свежевыжатый апельсиновый сок',
    price: 180,
    category: 'drink',
    kind: 'cold',
    count: '300мл',
    image: 'images/drink1.jpg'
  },
  {
    keyword: 'cranberry_morse',
    name: 'Морс клюквенный',
    price: 150,
    category: 'drink',
    kind: 'cold',
    count: '330мл',
    image: 'images/drink2.jpg'
  },
  {
    keyword: 'lemonade',
    name: 'Домашний лимонад',
    price: 160,
    category: 'drink',
    kind: 'cold',
    count: '400мл',
    image: 'images/drink4.jpg'
  },
  {
    keyword: 'cappuccino',
    name: 'Капучино',
    price: 200,
    category: 'drink',
    kind: 'hot',
    count: '250мл',
    image: 'images/drink3.jpg'
  },
  {
    keyword: 'black_tea',
    name: 'Черный чай с бергамотом',
    price: 120,
    category: 'drink',
    kind: 'hot',
    count: '300мл',
    image: 'images/drink6.jpg'
  },
  {
    keyword: 'latte',
    name: 'Латте с сиропом',
    price: 220,
    category: 'drink',
    kind: 'hot',
    count: '300мл',
    image: 'images/drink5.jpg'
  },
  
  // Десерты (6 штук: 3 маленьких, 2 средних, 1 большая)
  {
    keyword: 'tiramisu_small',
    name: 'Тирамису (маленький)',
    price: 190,
    category: 'dessert',
    kind: 'small',
    count: '120г',
    image: 'images/dessert2.jpg'
  },
  {
    keyword: 'cheesecake_small',
    name: 'Чизкейк (маленький)',
    price: 180,
    category: 'dessert',
    kind: 'small',
    count: '100г',
    image: 'images/dessert3.jpg'
  },
  {
    keyword: 'chocolate_mousse',
    name: 'Шоколадный мусс (маленький)',
    price: 170,
    category: 'dessert',
    kind: 'small',
    count: '110г',
    image: 'images/dessert4.jpg'
  },
  {
    keyword: 'apple_pie',
    name: 'Яблочный пирог (средний)',
    price: 240,
    category: 'dessert',
    kind: 'medium',
    count: '180г',
    image: 'images/dessert5.jpg'
  },
  {
    keyword: 'panna_cotta',
    name: 'Панна котта с ягодами (средний)',
    price: 220,
    category: 'dessert',
    kind: 'medium',
    count: '160г',
    image: 'images/dessert1.jpg'
  },
  {
    keyword: 'chocolate_cake',
    name: 'Шоколадный торт (большой)',
    price: 350,
    category: 'dessert',
    kind: 'large',
    count: '250г',
    image: 'images/dessert6.jpg'
  }
];