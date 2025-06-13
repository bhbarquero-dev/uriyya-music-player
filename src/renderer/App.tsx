import { Flex, Layout } from 'antd';

const { Header, Sider, Content } = Layout;

const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    height: 100,
    paddingInline: 48,
    lineHeight: '64px',
    backgroundColor: '#f0f0f0',
};

const contentStyle: React.CSSProperties = {
    textAlign: 'center',
    lineHeight: '120px',
    backgroundColor: '#fafafa',
};

const siderStyle: React.CSSProperties = {
    textAlign: 'center',
    lineHeight: '120px',
    backgroundColor: '#d9d9d9',
};

const layoutStyle = {
    borderRadius: 8,
    overflow: 'hidden',
};

export default function App() {
    return (
        <Flex>
            <Layout style={layoutStyle}>
                <Sider width="25%" style={siderStyle}>
                    Sider
                </Sider>
                <Layout>
                    <Header style={headerStyle}>Header</Header>
                    <Content style={contentStyle}>
                        <div style={{height:600}}></div>
                    </Content>
                </Layout>
            </Layout>
        </Flex>
    )
}
