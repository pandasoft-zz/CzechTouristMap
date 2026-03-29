<?xml-stylesheet type="text/xsl"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://mapsforge.org/renderTheme" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<!-- 
# OpenHikingMap
#
# Lines rendering: Protected areas
#
# Copyright (c) 2022-2023 OpenHiking contributors
# SPDX-License-Identifier: GPL-3.0-only
-->

<xsl:template name="lines-protected">
<xsl:variable name="prot-class-1-line-color">#FF956A</xsl:variable>
<xsl:variable name="prot-class-2-line-color">#39CA20</xsl:variable>
<!--#39CA20 #95588d42-->
<xsl:variable name="lc-protected">#588d42</xsl:variable>
<xsl:variable name="lc-protected-light">#40588d42</xsl:variable>
<xsl:variable name="lc-protected-strictly">#FF956A</xsl:variable>
<xsl:variable name="lc-protected-strictly-light">#40FF956A</xsl:variable>


<rule cat="protected_area" e="way" k="boundary" v="national_park" >
    <rule e="any" k="*" v="*" zoom-min="8" zoom-max="11">
        <line stroke="{$lc-protected}" stroke-width="{$lw-national-park-1}" stroke-dasharray="6,3"/>
    </rule>
    <rule e="any" k="*" v="*" zoom-min="12" zoom-max="13">
        <line stroke="{$lc-protected}" stroke-width="{$lw-national-park-2}" stroke-dasharray="6,3"/>
    </rule>
    <rule e="any" k="*" v="*" zoom-min="14">
        <line stroke="{$lc-protected}" stroke-width="{$lw-national-park-3}" stroke-dasharray="6,3"/>
    </rule>
    <rule e="any" k="*" v="*" zoom-min="10" zoom-max="12">
        <caption k="name" font-style="italic" font-family="sans_serif" font-size="10" fill="#588d42" stroke="#FFFFFF" stroke-width="1.5"/>
    </rule>
    <rule e="any" k="*" v="*" zoom-min="13">
        <caption k="name" font-style="italic" font-family="sans_serif" font-size="11" fill="#588d42" stroke="#FFFFFF" stroke-width="1.5"/>
    </rule>
</rule>


<rule cat="protected_area" e="way" k="boundary" v="protected_area">
   <rule e="any" k="protected_area_importance" v="major">
        <rule e="any" k="*" v="*" zoom-min="9" zoom-max="11">
            <line stroke="{$lc-protected}" stroke-width="{$lw-national-park-1}" stroke-dasharray="6,3"/>
        </rule>
        <rule e="any" k="*" v="*" zoom-min="12" zoom-max="13">
            <line stroke="{$lc-protected}" stroke-width="{$lw-national-park-2}" stroke-dasharray="6,3"/>
        </rule>
        <rule e="any" k="*" v="*" zoom-min="14">
            <line stroke="{$lc-protected}" stroke-width="{$lw-national-park-3}" stroke-dasharray="6,3"/>
        </rule>
        <rule e="any" k="*" v="*" zoom-min="11" zoom-max="12">
            <caption k="name" font-style="italic" font-family="sans_serif" font-size="10" fill="#588d42" stroke="#FFFFFF" stroke-width="1.5"/>
        </rule>
        <rule e="any" k="*" v="*" zoom-min="13">
            <caption k="name" font-style="italic" font-family="sans_serif" font-size="11" fill="#588d42" stroke="#FFFFFF" stroke-width="1.5"/>
        </rule>
    </rule>
    <rule e="any" k="protected_area_importance" v="~">
        <rule e="any" k="protect_class" v="1">
            <rule e="any" k="*" v="*" zoom-min="12" zoom-max="14">
                <line stroke="{$lc-protected-strictly}" stroke-width="{$lw-protected-strictly-2}" stroke-dasharray="4,3"/>
            </rule>
            <rule e="any" k="*" v="*" zoom-min="15">
                <line stroke="{$lc-protected-strictly}" stroke-width="{$lw-protected-strictly-3}" stroke-dasharray="4,3"/>
            </rule>
            <rule e="any" k="*" v="*" zoom-min="13">
                <caption k="name" font-style="italic" font-family="sans_serif" font-size="10" fill="#ff7f5a" stroke="#FFFFFF" stroke-width="1.5"/>
            </rule>
        </rule>
        <rule e="any" k="protect_class" v="2|~" zoom-min="12">
            <rule e="any" k="*" v="*" zoom-min="12" zoom-max="13">
                <line stroke="{$lc-protected}" stroke-width="{$lw-protected-area-2}" stroke-dasharray="4,3"/>
            </rule>
            <rule e="any" k="*" v="*" zoom-min="14" zoom-max="15">
                <line stroke="{$lc-protected}" stroke-width="{$lw-protected-area-3}" stroke-dasharray="4,3"/>
            </rule>
            <rule e="any" k="*" v="*" zoom-min="16">
                <line stroke="{$lc-protected}" stroke-width="{$lw-protected-area-4}" stroke-dasharray="4,3"/>
            </rule>
            <rule e="any" k="*" v="*" zoom-min="13" zoom-max="14">
                <caption k="name" font-style="italic" font-family="sans_serif" font-size="10" fill="#588d42" stroke="#FFFFFF" stroke-width="1.5"/>
            </rule>
            <rule e="any" k="*" v="*" zoom-min="15">
                <caption k="name" font-style="italic" font-family="sans_serif" font-size="11" fill="#588d42" stroke="#FFFFFF" stroke-width="1.5"/>
            </rule>
        </rule>
    </rule>
</rule>


</xsl:template>
</xsl:stylesheet>