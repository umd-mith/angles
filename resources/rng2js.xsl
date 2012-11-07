<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:r="http://relaxng.org/ns/structure/1.0"
  version="2.0" >
  <xsl:output method="text" omit-xml-declaration="yes"/>
  
  <xsl:template name="ns" xml:space="default">
    <xsl:param name="ns"/>
    <xsl:choose>
      <xsl:when test="$ns = 'http://www.w3.org/XML/1998/namespace'">xml:</xsl:when>
      <xsl:otherwise/>
    </xsl:choose>
  </xsl:template>
  
  <xsl:template match="/">schema({
<xsl:apply-templates select="r:grammar/r:start"/>,
<xsl:for-each select="r:grammar/r:define">
  <xsl:apply-templates select="."/><xsl:if test="position() != last()">,
</xsl:if>
</xsl:for-each>
})</xsl:template>
  
  <xsl:template match="r:start"><xsl:variable name="model"><xsl:apply-templates/></xsl:variable>_start: "<xsl:value-of select="replace($model,'(\r|\n|\s)+','')"></xsl:value-of>"</xsl:template>
  
  <xsl:template match="r:define">
    <xsl:variable name="model"><xsl:apply-templates select="r:element/r:group/*[not(descendant::r:attribute)]"/></xsl:variable>
    <xsl:variable name="children">
      <xsl:for-each select=".//r:ref">
        "<xsl:value-of select="@name"/>"<xsl:if test="position() != last()">,</xsl:if>
      </xsl:for-each>
    </xsl:variable>
    <xsl:value-of select="r:element/@name"/>: { 
    model: "<xsl:value-of select="replace($model,'(\r|\n|\s)+','')"></xsl:value-of>",
    children: [<xsl:value-of select="replace($children,'(\r|\n|\s)+','')"/>],
    attributes: {<xsl:for-each select="r:element/r:group/*[descendant::r:attribute]"><xsl:variable name="attr"><xsl:apply-templates select="." mode="attr"/></xsl:variable><xsl:value-of select="replace($attr,'(\r|\n|\s)+','')"/><xsl:if test="position() != last()"><xsl:text>, </xsl:text></xsl:if></xsl:for-each>}}</xsl:template>
  
  <xsl:template match="r:attribute" mode="attr"><xsl:variable name="value"><xsl:apply-templates/></xsl:variable>"<xsl:call-template name="ns"><xsl:with-param name="ns" select="@ns"/></xsl:call-template><xsl:value-of select="@name"/>": {optional: <xsl:choose><xsl:when test="ancestor::r:optional">true</xsl:when><xsl:otherwise>false</xsl:otherwise></xsl:choose>, value: "<xsl:value-of select="replace($value,'(\r|\n|\s)+','')"></xsl:value-of>"}</xsl:template>
  
  <xsl:template match="r:ref">(<xsl:value-of select="@name"/>,)</xsl:template>
  
  <xsl:template match="r:choice">(<xsl:for-each select="*"><xsl:apply-templates select="."/><xsl:if test="position() != last()">|</xsl:if></xsl:for-each>)</xsl:template>
  
  <xsl:template match="r:optional"><xsl:apply-templates/>*</xsl:template>
  
  <xsl:template match="r:optional" mode="attr"><xsl:apply-templates mode="attr"/></xsl:template>
  
  <xsl:template match="r:zeroOrMore">(<xsl:apply-templates/>)*</xsl:template>
  
  <xsl:template match="r:oneOrMore">(<xsl:apply-templates/>)+</xsl:template>
  
  <xsl:template match="r:group">(<xsl:apply-templates/>)</xsl:template>
  
  <xsl:template match="r:list"><xsl:apply-templates/>\s?</xsl:template>
  
  <xsl:template match="r:empty">_empty_</xsl:template>
  
  <xsl:template match="r:text">_text_</xsl:template>
</xsl:stylesheet>