'use client';

import { useEffect, useState } from 'react';

import { type IntrospectionQuery } from 'graphql';
import clsx from 'clsx';

import SelectArrowBottomIcon from '@/assets/images/icons/SelectArrowBottomIcon';
import SelectArrowTopIcon from '@/assets/images/icons/SelectArrowTopIcon';
import { TRequestMethod } from '@/interfaces/RequestMethod';
import type { IResponse } from '@/interfaces/Response';
import { loadingFinished, loadingStarted } from '@/store/reducers/loadingStateSlice';
import { useAppDispatch } from '@/hooks/redux';
import { replaceInHistory } from '@/utils/replaceHistory';
import useHeaders from '@/hooks/useHeaders';
import { GRAPHQL } from '@/utils/constants';
import { Response } from '../Response/Response';
import Button from '../UI/Button/Button';
import { Docs } from './Docs/Docs';
import { HeadersEditor } from './HeadersEditor/HeadersEditor';
import { QueryEditor } from './QueryEditor/QueryEditor';
import { RequestControl } from './RequestControl/RequestControl';
import { VariablesEditor } from './VariablesEditor/VariablesEditor';

import style from './GraphiQLClient.module.scss';

interface IProps {
  graphqlDocsIsOpen?: boolean;
}

enum TTabs {
  HEADERS = 'HEADERS',
  VARIABLES = 'VARIABLES',
}

export default function GraphiQLClient({ graphqlDocsIsOpen }: IProps): JSX.Element {
  const [url, setUrl] = useState('');
  const [sdlUrl, setSdlUrl] = useState('');
  const [docs, setDocs] = useState<IntrospectionQuery | null>(null);
  const [response, setResponse] = useState<IResponse | null>(null);
  const [query, setQuery] = useState('');
  const [variables, setVariables] = useState(JSON.stringify({}));
  const [headerKey, setHeaderKey] = useState('Content-type');
  const [headerValue, setHeaderValue] = useState('application/json');
  const [activeTab, setActiveTab] = useState<TTabs>(TTabs.VARIABLES);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const dispatcher = useAppDispatch();
  const headers = useHeaders();

  useEffect(() => {
    replaceInHistory('method', GRAPHQL);
  }, []);

  useEffect(() => {
    replaceInHistory('headers', headers);
  }, [headers]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    const { href } = window.location;
    const apiUrl = href.replace(/\/restapi\/|\/graphiql\//g, '/api/');
    dispatcher(loadingStarted());

    try {
      const res = await fetch(apiUrl, {
        method: TRequestMethod.POST,
      });

      if (!res.ok) {
        throw new Error(res.statusText);
      }

      const data = await res.json();

      if (data !== null) {
        setResponse(data as IResponse);
      }
    } catch (error) {
      setResponse({
        body: null,
        status: 500,
        statusText: (error as Error).message,
        headers: {},
      });
    } finally {
      dispatcher(loadingFinished());
    }
  };

  return (
    <div className={style.wrapper}>
      {graphqlDocsIsOpen === true ? <Docs schema={docs} /> : null}

      <div className={style.container}>
        <form className={style.form} onSubmit={handleSubmit}>
          <RequestControl url={url} setUrl={setUrl} sdlUrl={sdlUrl} setSdlUrl={setSdlUrl} setDocs={setDocs} />
          <QueryEditor query={query} setQuery={setQuery} />
          <div className={style.options}>
            <div className={style.tabs_line}>
              <div className={style.tabs}>
                <Button
                  className={clsx(style.button, activeTab === TTabs.VARIABLES ? style.active : '')}
                  onClick={() => {
                    setActiveTab(TTabs.VARIABLES);
                  }}
                >
                  Variables
                </Button>
                <Button
                  className={clsx(style.button, activeTab === TTabs.HEADERS ? style.active : '')}
                  onClick={() => {
                    setActiveTab(TTabs.HEADERS);
                  }}
                >
                  Headers
                </Button>
              </div>
            </div>
            {isOptionsOpen && (
              <div>
                {activeTab === TTabs.VARIABLES && <VariablesEditor variables={variables} setVariables={setVariables} />}
                {activeTab === TTabs.HEADERS && (
                  <HeadersEditor
                    headerKey={headerKey}
                    setHeaderKey={setHeaderKey}
                    headerValue={headerValue}
                    setHeaderValue={setHeaderValue}
                  />
                )}
              </div>
            )}
            {!isOptionsOpen && <div className={style.options_closed} />}

            <div className={style.buttons}>
              <Button
                className={style.select_arrow_icon}
                onClick={() => {
                  setIsOptionsOpen(!isOptionsOpen);
                }}
              >
                {isOptionsOpen && <SelectArrowTopIcon />}
                {!isOptionsOpen && <SelectArrowBottomIcon />}
              </Button>
            </div>
          </div>
        </form>
        {response?.status != null && <Response response={response} method={TRequestMethod.POST} />}
      </div>
    </div>
  );
}
