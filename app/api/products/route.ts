import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { logActivity } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('response' in auth) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const stockStatus = searchParams.get('stockStatus') || '';
    const pageId = searchParams.get('pageId') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    const where: any = { userId: auth.user.id };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
        { category: { contains: search } },
      ];
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (stockStatus && stockStatus !== 'ALL') {
      where.stockStatus = stockStatus;
    }

    if (pageId && pageId !== 'ALL') {
      where.pageId = pageId;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          page: {
            select: {
              id: true,
              pageName: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Distinct categories for filter
    const distinctCategories = await prisma.product.findMany({
      where: { userId: auth.user.id, category: { not: null } },
      select: { category: true },
      distinct: ['category'],
    });

    const categories = distinctCategories.map((c) => c.category).filter(Boolean) as string[];

    return NextResponse.json({
      success: true,
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      categories,
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'প্রোডাক্ট তালিকা লোড করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if ('response' in auth) return auth.response;

  try {
    const body = await req.json();
    const {
      name,
      description,
      sku,
      category,
      price,
      discountPrice,
      stockQuantity,
      stockStatus,
      imageUrl,
      deliveryInfo,
      productAiInstructions,
      pageId,
    } = body;

    if (!name || price === undefined || price === null) {
      return NextResponse.json(
        { success: false, error: 'পণ্যের নাম এবং মূল্য আবশ্যক।' },
        { status: 400 }
      );
    }

    const numericPrice = parseFloat(price);
    const numericDiscount = discountPrice ? parseFloat(discountPrice) : null;
    const numericQty = stockQuantity ? parseInt(stockQuantity, 10) : 0;

    const product = await prisma.product.create({
      data: {
        userId: auth.user.id,
        pageId: pageId && pageId !== 'ALL' ? pageId : null,
        name: name.trim(),
        description: description ? description.trim() : null,
        sku: sku ? sku.trim() : null,
        category: category ? category.trim() : null,
        price: numericPrice,
        discountPrice: numericDiscount,
        stockQuantity: numericQty,
        stockStatus: stockStatus || (numericQty > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK'),
        imageUrl: imageUrl ? imageUrl.trim() : null,
        deliveryInfo: deliveryInfo ? deliveryInfo.trim() : null,
        productAiInstructions: productAiInstructions ? productAiInstructions.trim() : null,
        isActive: true,
      },
    });

    await logActivity({
      userId: auth.user.id,
      pageId: product.pageId,
      action: 'PRODUCT_CREATED',
      description: `নতুন প্রোডাক্ট যুক্ত করা হয়েছে: ${product.name} (দাম: ${product.price} টাকা)`,
    });

    return NextResponse.json({
      success: true,
      message: 'প্রোডাক্ট সফলভাবে যুক্ত হয়েছে!',
      product,
    });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'প্রোডাক্ট যুক্ত করতে ব্যর্থ হয়েছে।' },
      { status: 500 }
    );
  }
}
