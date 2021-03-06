package com.cxq.o2o.service.impl;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cxq.o2o.dao.ProductDao;
import com.cxq.o2o.dao.ProductImgDao;
import com.cxq.o2o.dto.ImageHolder;
import com.cxq.o2o.dto.ProductExecution;
import com.cxq.o2o.entity.Product;
import com.cxq.o2o.entity.ProductImg;
import com.cxq.o2o.enums.ProductStateEnum;
import com.cxq.o2o.exceptions.ProductOperationException;
import com.cxq.o2o.service.ProductService;
import com.cxq.o2o.util.ImageUtil;
import com.cxq.o2o.util.PathUtil;

@Service
public class ProductServiceImpl implements ProductService {

	@Autowired
	private ProductDao productDao;
	@Autowired
	private ProductImgDao productImgDao;
	
	@Override
	@Transactional
	/*1、处理缩略图,获取缩略图相对路径并赋值给product
	2、往tb_product写入商品信息，获取productId
	3、结合productId批量处理商品详情图
	4、将商品详情图列表批量插入tb_product_img中*/
	public ProductExecution addProduct(Product product,ImageHolder thumbnail,
			List<ImageHolder> productImgList) throws ProductOperationException {
		//空值判断
		if(product != null && product.getShop() != null && product.getShop().getShopId() != null) {
			//给商品设置上默认属性
			product.setCreateTime(new Date());
			product.setLastEditTime(new Date());
			//默认为上架的状态
			product.setEnableStatus(1);
			//若商品缩略图不为空则添加
			if(thumbnail != null) {
				addThumbnail(product,thumbnail);
			}
			try {
				//创建商品信息
				int effectedNum = productDao.insertProduct(product);
				if(effectedNum <= 0) {
					throw new ProductOperationException("创建商品失败");
				}
			}catch(Exception e) {
				throw new ProductOperationException("创建 商品失败: " + e.toString());
			}
			
			//商品详情图不为空则添加
			if(productImgList != null && productImgList.size() > 0) {
				addProductImgList(product,productImgList);
			}
			return new ProductExecution(ProductStateEnum.SUCCESS,product);
		}else {
			//传参为空则返回空值错误信息
			return new ProductExecution(ProductStateEnum.EMPTY);
		}
	}
	
	/**
	 * 添加缩略图
	 * 
	 * @param product
	 * @param thumbnail
	 */
	private void addThumbnail(Product product,ImageHolder thumbnail) {
		String dest = PathUtil.getShopImagePath(product.getShop().getShopId());
		String thumbnialAddr = ImageUtil.generateThumbnail(thumbnail, dest);
		product.setImgAddr(thumbnialAddr);
	}
	
	/**
	 * 批量添加图片
	 * 
	 * @param product
	 * @param productImgList
	 */
	private void addProductImgList(Product product, List<ImageHolder> productImgList) {
		// TODO Auto-generated method stub
		//获取图片存储路径，这里直接存放到相应店铺的文件夹底下
		String dest = PathUtil.getShopImagePath(product.getShop().getShopId());
		List<ProductImg> productImgList1 = new ArrayList<ProductImg>();
		//遍历图片一次去处理，并添加进ProductImg实体类里
		for(ImageHolder productImgHolder : productImgList) {
			String imgAddr = ImageUtil.generateNormalImg(productImgHolder.getImage(), productImgHolder.getImageName(), dest);
			ProductImg productImg = new ProductImg();
			productImg.setImgAddr(imgAddr);
			productImg.setProductId(product.getProductId());
			productImg.setCreateTime(new Date());
			productImgList1.add(productImg);
		}
		//如果确实是有图片需要添加的，就执行批量添加操作
		if(productImgList.size() > 0) {
			try {
				int effectedNum = productImgDao.batchInsertProductImg(productImgList1);
				if(effectedNum <= 0) {
					throw new ProductOperationException("创建商品详情图片失败");
				}
			}catch(Exception e) {
				throw new ProductOperationException("创建商品详情图片失败: " + e.toString());
			}
		}
	}

	

}
