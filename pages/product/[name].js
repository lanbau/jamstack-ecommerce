import { useState } from 'react'
import Head from 'next/head'
import Button from '../../components/Button'
import Image from '../../components/Image'
import QuantityPicker from '../../components/QuantityPicker'
import { fetchInventory } from '../../utils/inventoryProvider'
import { slugify } from '../../utils/helpers'
import CartLink from '../../components/CartLink'
import { SiteContext, ContextProviderComponent } from '../../context/mainContext'

const ItemView = (props) => {
  const [numberOfitems, updateNumberOfItems] = useState(1)
  const { product } = props
  const { price, image, name, description } = product
  const { context: { addToCart }} = props

  function addItemToCart (product) {
    product["quantity"] = numberOfitems
    addToCart(product)
  }

  function increment() {
    updateNumberOfItems(numberOfitems + 1)
  }

  function decrement() {
    if (numberOfitems === 1) return
    updateNumberOfItems(numberOfitems - 1)
  }

  function addProductJsonLd() {
    return {
      __html: `{
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": "Executive Anvil",
      "image": [
        "https://example.com/photos/1x1/photo.jpg",
        "https://example.com/photos/4x3/photo.jpg",
        "https://example.com/photos/16x9/photo.jpg"
       ],
      "description": "Sleeker than ACME's Classic Anvil, the Executive Anvil is perfect for the business traveler looking for something to drop from a height.",
      "sku": "0446310786",
      "mpn": "925872",
      "brand": {
        "@type": "Brand",
        "name": "ACME"
      },
      "review": {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "4",
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Fred Benson"
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.4",
        "reviewCount": "89"
      },
      "offers": {
        "@type": "Offer",
        "url": "https://example.com/anvil",
        "priceCurrency": "USD",
        "price": "119.99",
        "priceValidUntil": "2020-11-20",
        "itemCondition": "https://schema.org/UsedCondition",
        "availability": "https://schema.org/InStock"
      }
    }
  `,
    };
  }

  return (
    <>
      <CartLink />
      <Head>
        <title>Jamstack ECommerce - {name}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`Jamstack ECommerce - ${name}`} key="title" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={addProductJsonLd()}
          key="product-jsonld"
        />
      </Head>
      <div className="
        sm:py-12
        md:flex-row
        py-4 w-full flex flex-1 flex-col my-0 mx-auto
      ">
        <div className="w-full md:w-1/2 h-120 flex flex-1 bg-light hover:bg-light-200">
          <div className="py-16 p10 flex flex-1 justify-center items-center">
            <Image src={image} alt="Inventory item" className="max-h-full" />
          </div>
        </div>
        <div className="pt-2 px-0 md:px-10 pb-8 w-full md:w-1/2">
          <h1 className="
           sm:mt-0 mt-2 text-5xl font-light leading-large
          ">{name}</h1>
          <h2 className="text-2xl tracking-wide sm:py-8 py-6">${price}</h2>
          <p className="text-gray-600 leading-7">{description}</p>
          <div className="my-6">
            <QuantityPicker
              increment={increment}
              decrement={decrement}
              numberOfitems={numberOfitems}
            />
          </div>
          <Button
            full
            title="Add to Cart"
            onClick={() => addItemToCart(product)}
          />
        </div>
      </div>
    </>
  )
}

export async function getStaticPaths () {
  const inventory = await fetchInventory()
  const paths = inventory.map(item => {
    return { params: { name: slugify(item.name) }}
  })
  return {
    paths,
    fallback: false
  }
}

export async function getStaticProps ({ params }) {
  const name = params.name.replace(/-/g," ")
  const inventory = await fetchInventory()
  const product = inventory.find(item => slugify(item.name) === slugify(name))

  return {
    props: {
      product,
    }
  }
}

function ItemViewWithContext(props) {
  return (
    <ContextProviderComponent>
      <SiteContext.Consumer>
        {
          context => <ItemView {...props} context={context} />
        }
      </SiteContext.Consumer>
    </ContextProviderComponent>
  )
}

export default ItemViewWithContext